from pathlib import Path
import secrets

root = Path(__file__).resolve().parents[1]
env = root / 'backend/.env'
if env.exists():
    print('Existing backend/.env preserved.')
else:
    text = (root / 'backend/.env.example').read_text()
    text = text.replace('replace-with-a-random-secret-of-at-least-32-characters', secrets.token_urlsafe(48))
    env.write_text(text, encoding='utf8')
    print('Created private backend/.env with a random session secret and local MongoDB settings. Provider keys remain unconfigured.')
