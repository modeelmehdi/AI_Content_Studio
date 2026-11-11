import asyncio
import json
import sqlite3
import time
import re
from pathlib import Path
from datetime import datetime, timezone
from pymongo import AsyncMongoClient, ReturnDocument
from pymongo.errors import DuplicateKeyError


class DuplicateRecord(Exception):
    pass


class SQLiteStore:
    """Explicit local-development storage, never a fallback for a failed Atlas connection."""
    def __init__(self, path):
        self.path = path
        self.lock = asyncio.Lock()

    async def open(self):
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        self.connection = sqlite3.connect(self.path, check_same_thread=False)
        self.connection.execute('PRAGMA journal_mode=WAL')
        self.connection.execute('CREATE TABLE IF NOT EXISTS documents (collection TEXT, id TEXT, data TEXT, PRIMARY KEY(collection,id))')
        self.connection.execute("CREATE UNIQUE INDEX IF NOT EXISTS user_email ON documents(json_extract(data,'$.email')) WHERE collection='users'")
        self.connection.commit()

    async def close(self):
        self.connection.close()

    def _all(self, collection, query):
        rows = self.connection.execute('SELECT data FROM documents WHERE collection=?', (collection,)).fetchall()
        documents = [json.loads(row[0]) for row in rows]
        return [d for d in documents if all(d.get(k) == v for k, v in query.items())]

    async def insert(self, collection, document):
        async with self.lock:
            try:
                self.connection.execute('INSERT INTO documents VALUES(?,?,?)', (collection, document['id'], json.dumps(document)))
                self.connection.commit()
            except sqlite3.IntegrityError as exc:
                self.connection.rollback()
                raise DuplicateRecord from exc
        return document

    async def find(self, collection, query, limit=100, skip=0, sort='created_at', descending=True, search=''):
        async with self.lock:
            rows = self._all(collection, query)
        if search:
            rows = [row for row in rows if search.casefold() in row.get('title', '').casefold()]
        rows.sort(key=lambda d: d.get(sort, ''), reverse=descending)
        return rows[skip:skip + limit]

    async def one(self, collection, query):
        rows = await self.find(collection, query, limit=1)
        return rows[0] if rows else None

    async def count(self, collection, query, search=''):
        async with self.lock:
            return sum(1 for row in self._all(collection, query) if not search or search.casefold() in row.get('title', '').casefold())

    async def update(self, collection, query, changes):
        async with self.lock:
            rows = self._all(collection, query)
            if not rows:
                return None
            document = {**rows[0], **changes}
            self.connection.execute('UPDATE documents SET data=? WHERE collection=? AND id=?', (json.dumps(document), collection, document['id']))
            self.connection.commit()
            return document

    async def delete(self, collection, query):
        async with self.lock:
            rows = self._all(collection, query)
            for row in rows:
                self.connection.execute('DELETE FROM documents WHERE collection=? AND id=?', (collection, row['id']))
            self.connection.commit()
            return len(rows)

    async def rate(self, key, limit, window):
        async with self.lock:
            now = int(time.time())
            rows = self._all('rate_limits', {'id': key})
            entry = rows[0] if rows and rows[0]['expires'] > now else {'id': key, 'count': 0, 'expires': now + window}
            entry['count'] += 1
            self.connection.execute('INSERT OR REPLACE INTO documents VALUES(?,?,?)', ('rate_limits', key, json.dumps(entry)))
            self.connection.commit()
            self.connection.execute("DELETE FROM documents WHERE collection IN ('rate_limits','sessions') AND CAST(json_extract(data,'$.expires') AS INTEGER) < ?", (now,))
            self.connection.commit()
            return entry['count'] <= limit


class MongoStore:
    def __init__(self, uri, name):
        self.client = AsyncMongoClient(uri, serverSelectionTimeoutMS=10000)
        self.db = self.client[name]

    async def open(self):
        await self.client.admin.command('ping')
        await self.db.users.create_index('email', unique=True)
        for name in ('generated_content', 'generation_history', 'usage_records'):
            await self.db[name].create_index([('user_id', 1), ('created_at', -1)])
        await self.db.user_settings.create_index('user_id', unique=True)
        await self.db.sessions.create_index('user_id')
        for name in ('sessions', 'rate_limits'):
            await self.db[name].create_index('expires_at', expireAfterSeconds=0)

    async def close(self):
        await self.client.close()

    def clean(self, document):
        if document:
            document.pop('_id', None)
            document.pop('expires_at', None)
        return document

    async def insert(self, collection, document):
        doc = {**document, '_id': document['id']}
        if 'expires' in doc:
            doc['expires_at'] = datetime.fromtimestamp(doc['expires'], timezone.utc)
        try:
            await self.db[collection].insert_one(doc)
        except DuplicateKeyError as exc:
            raise DuplicateRecord from exc
        return document

    async def find(self, collection, query, limit=100, skip=0, sort='created_at', descending=True, search=''):
        if search:
            query = {**query, 'title': {'$regex': re.escape(search), '$options': 'i'}}
        cursor = self.db[collection].find(query).sort(sort, -1 if descending else 1).skip(skip).limit(limit)
        return [self.clean(d) async for d in cursor]

    async def one(self, collection, query):
        return self.clean(await self.db[collection].find_one(query))

    async def count(self, collection, query, search=''):
        if search:
            query = {**query, 'title': {'$regex': re.escape(search), '$options': 'i'}}
        return await self.db[collection].count_documents(query)

    async def update(self, collection, query, changes):
        updates = dict(changes)
        if 'expires' in updates:
            updates['expires_at'] = datetime.fromtimestamp(updates['expires'], timezone.utc)
        return self.clean(await self.db[collection].find_one_and_update(query, {'$set': updates}, return_document=ReturnDocument.AFTER))

    async def delete(self, collection, query):
        return (await self.db[collection].delete_many(query)).deleted_count

    async def rate(self, key, limit, window):
        now = int(time.time())
        bucket = f'{key}:{now // window}'
        document = await self.db.rate_limits.find_one_and_update({'_id': bucket}, {'$inc': {'count': 1}, '$setOnInsert': {'expires_at': datetime.fromtimestamp(now + window * 2, timezone.utc)}}, upsert=True, return_document=ReturnDocument.AFTER)
        return document['count'] <= limit
