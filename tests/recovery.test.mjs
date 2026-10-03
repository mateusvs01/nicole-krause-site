import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const redirectScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];
for (const key of ['recovery_token', 'invite_token', 'confirmation_token']) {
  test(`${key} reaches admin with its original fragment`, () => {
    const hash = `#${key}=fake-test-value&extra=1`;
    let target;
    runInNewContext(redirectScript, { window: { location: { hash, replace: value => { target = value; } } } });
    assert.equal(target, `/admin/${hash}`);
  });
}
test('regular navigation stays on the public page', () => {
  for (const hash of ['', '#sobre', '#contato']) {
    runInNewContext(redirectScript, { window: { location: { hash, replace: () => assert.fail('Unexpected redirect') } } });
  }
});
test('admin assets resolve independently of trailing slash', () => {
  const admin = readFileSync(new URL('../dist/admin/index.html', import.meta.url), 'utf8');
  for (const base of ['https://example.test/admin', 'https://example.test/admin/']) {
    for (const file of ['admin.css', 'admin.js']) {
      assert.ok(admin.includes(`"/admin/${file}`));
      assert.equal(new URL(`/admin/${file}`, base).pathname, `/admin/${file}`);
    }
  }
});
