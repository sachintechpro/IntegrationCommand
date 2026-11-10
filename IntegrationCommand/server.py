"""Minimal static server for IntegrationCommand (no external dependencies)."""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

if __name__ == '__main__':
    os.chdir(Path(__file__).resolve().parent)
    port = int(os.environ.get('PORT', '10000'))
    print(f'IntegrationCommand listening on {port}', flush=True)
    ThreadingHTTPServer(('0.0.0.0', port), SimpleHTTPRequestHandler).serve_forever()
