# Plan sửa lỗ hổng bảo mật — cf-node-client 1.0.9

- Repo: `D:\DevSpaces\LEOPACKWS\cf-node-client` (branch `feat/refinement`, đang behind origin 21 commit — pull trước khi sửa)
- Audit: 2026-11-20, STRIDE + OWASP, chỉ đọc (files edited: 0, git mutations: none)
- Phạm vi đã quét: `index.js`, toàn bộ `lib/` (31 file), `.github/workflows/` (4 file), `package.json`, `npm audit` (runtime + dev), secret regex trên toàn repo (trừ `node_modules`), lịch sử git của `config.json` / `examples/config.json`
- Ngoài phạm vi: `obsolete/` (không publish — bị `.npmignore` loại), `doc/` (HTML sinh ra), `test/`, nội dung `node_modules`

## Bối cảnh mối đe dọa

Đây là thư viện client: nó nhận username/password, client secret, bearer token từ ứng dụng gọi nó và gửi tới UAA / Cloud Controller. Kẻ tấn công thực tế:
1. **Kẻ đứng giữa mạng** (Wi-Fi công cộng, proxy công ty, DNS bị chiếm) — nhắm vào credential đang truyền.
2. **Người dùng cuối của ứng dụng dùng lib** (portal/web tool) — đưa input độc vào GUID, tên app, filter.
3. **Chuỗi cung ứng** — gói npm phụ thuộc có lỗ hổng, CI publish.

## Tóm tắt

| Mức | Số lượng |
|---|---|
| Critical | 1 |
| High | 2 |
| Medium | 4 |
| Low | 5 |
| Info | 3 |

## Bảng phát hiện

| # | Mức | STRIDE / OWASP | File:Line | Mô tả | Hướng sửa |
|---|---|---|---|---|---|
| C1 | Critical | Info Disclosure, Spoofing / A02, A07 | `lib/utils/HttpUtils.js:11`, dùng ở `:68`, `:223` | `https.Agent({ rejectUnauthorized: false })` áp cho **mọi** request HTTPS, kể cả `/oauth/token` mang password/client secret và mọi call mang bearer token. Không có option nào để bật lại kiểm tra cert. Kẻ MITM với cert tự ký lấy được credential admin CF. | Mặc định verify TLS. Thêm option opt-in `skipSslValidation` (giống `cf --skip-ssl-validation`) và `ca` (custom CA) truyền qua constructor → `HttpUtils`. Ghi rõ breaking change trong CHANGELOG / MIGRATION_GUIDE. |
| H1 | High | Supply chain / A06 | `package.json` `dependencies` | `protobufjs@7.5.4` (critical: code injection, RCE — GHSA-xq3m-2v4x-88gg …) và `ws@8.19.0` (high: memory disclosure, DoS) nằm trong `dependencies` nhưng **không file nào trong `lib/` require chúng**. Không khai thác được qua lib, nhưng mọi dự án cài cf-node-client đều kéo theo và `npm audit` của họ báo critical. | Xoá `protobufjs` và `ws` khỏi `dependencies`; `npm install` để cập nhật lock. |
| H2 | High | Info Disclosure / A02 | `lib/model/cloudcontroller/CloudControllerBase.js:17` | `isValidEndpoint` chấp nhận `http:`. Token/password gửi qua plaintext nếu người dùng cấu hình nhầm hoặc endpoint bị downgrade. | Từ chối `http:` trừ khi `allowInsecureHttp: true` hoặc host là `localhost`/`127.0.0.1`. |
| M1 | Medium | Tampering / A03, A06 | `package.json` (`form-data@4.0.5`), `lib/utils/HttpUtils.js:230-231` | `form-data` 4.0.0–4.0.5 có CRLF injection qua field name/filename. Filename lấy từ `path.basename(filePath)` do caller truyền → có thể chèn header vào multipart. | Nâng `form-data` lên bản đã vá (`npm audit fix`). Cân nhắc cố định filename upload là `application.zip`/`bits.zip`. |
| M2 | Medium | Tampering, EoP / A01, A10 | Mọi URL dạng `` `${this.API_URL}/v3/.../${guid}` `` (vd `AppsCopy.js:64,86`, `AppsDeployment.js:41,96-325`, `Domains.js:55`, `Jobs.js:69,99,110,135`, `Organizations.js:111-216`, …); query thô ở `Logs.js:29` (`?app=${appGuid}`) và `AppsCopy.js:51` (`?source_guid=`) | 0 lần dùng `encodeURIComponent` trong `lib/`. GUID chứa `../` hoặc `?`/`&` sẽ đổi đường dẫn/tham số trong khi request vẫn mang bearer token → ứng dụng dùng lib với input người dùng có thể bị gọi sang endpoint CC khác (vd đọc `/v3/service_credential_bindings/{id}/details`). | Một helper duy nhất trong `CloudControllerBase` để build path, `encodeURIComponent` từng segment; query đi qua `qs` (đã encode bởi `URLSearchParams`). Tuỳ chọn: validate GUID bằng regex UUID ở boundary. |
| M3 | Medium | Info Disclosure / A01 | `CloudControllerBase.js:249-251` (cache key), `:62-83` (`setEndPoint`/`setToken`) | Cache `getAll*` dùng key chỉ từ filter, không gắn token hay endpoint. Sau `setToken(userB)` trên cùng instance, trong TTL vẫn trả dữ liệu của user A. Chỉ xảy ra khi bật `cache: true` và tái dùng instance cho nhiều user (server đa người dùng). | `setToken`/`setEndPoint` gọi `clearCache()`; hoặc thêm hash token + `API_URL` vào cache key. |
| M4 | Medium | Supply chain / A08 | `.github/workflows/ci.yml:22,32`, `publish.yml`, `release.yml` | Action pin theo tag (`actions/checkout@v4`, `setup-node@v4`, `softprops/action-gh-release@v2`) chứ không theo SHA; `secrets: inherit` đẩy toàn bộ secret vào publish/release thay vì chỉ `NPM_TOKEN`; không có `permissions:` mặc định cấp workflow; `npm publish` không `--provenance`; `npm ci` chạy install script của dependency. | Pin SHA; truyền secret tường minh; `permissions: { contents: read }` ở top-level, `id-token: write` cho job publish; `npm publish --provenance --access public`; `npm ci --ignore-scripts` ở job publish. Bỏ Node 16 (EOL) khỏi matrix `test.yml`. |
| L1 | Low | DoS / A05 | `HttpUtils.js:105`, `:117`, `:262` | Không timeout, không giới hạn kích thước response; `downloadBits`/`downloadDroplet` buffer toàn bộ vào RAM. Endpoint chậm/độc làm treo hoặc hết bộ nhớ tiến trình gọi. | Thêm `timeout` (node-fetch v2 có `timeout`, hoặc `AbortController`) và option `maxResponseSize`; với download, cân nhắc trả stream. |
| L2 | Low | Tampering / A03 | `AppsCore.js:86-87`, `Organizations.js:103`, `ServiceInstances.js:108-109,453`, `Spaces.js:104-105` | Filter v2 `q` ghép thẳng `name:${name}`; tên chứa `;` hoặc toán tử (`IN`, `>`) thay đổi điều kiện lọc → trả về resource khác ý định. | Từ chối/escape `;` và ký tự toán tử trong `name`, hoặc dùng filter v3 `names=` (đã encode). |
| L3 | Low | Tampering / A03 | `lib/model/uaa/UsersUAA.js:82` | `getUsers(searchOptions)` nối chuỗi query thô vào URL SCIM → filter injection nếu caller chuyển input người dùng. | Nhận object filter, build qua `qs`. Giữ chữ ký cũ cho tương thích nhưng ghi deprecation. |
| L4 | Low | Info Disclosure / A09 | `HttpUtils.js:115`, `:139`, `:266` | Error message chứa nguyên body response; ứng dụng thường log `err.message` → body UAA/CC (có thể có chi tiết nội bộ) lọt vào log. `:269` `JSON.parse` không bọc try. | Message ngắn (`HTTP <status> <method> <path>`), body đặt ở `err.body`; bọc `JSON.parse`. |
| L5 | Low | Dev supply chain / A06 | `devDependencies` | 22 lỗ hổng dev-only (lodash code injection qua grunt, minimatch/brace-expansion ReDoS, js-yaml, markdown-it, taffydb…). Không ship cho người dùng (`files` chỉ gồm `index.js`, `lib`, `types`) nhưng chạy trên máy dev/CI. `optimist@0.6.1` đã bỏ. | `npm audit fix`; cân nhắc bỏ grunt (chỉ dùng cho docs) và `optimist`. |
| I1 | Info | — | `UsersUAA.js:242-256` | `decodeToken` không verify chữ ký — có ghi trong JSDoc, nhưng dễ bị dùng sai cho phân quyền. | Thêm cảnh báo trong README/types: không dùng claim đã decode để quyết định quyền. |
| I2 | Info | — | `UsersUAA.js:163-169` | `loginWithApiKey` tự bịa `expires_in: 43199`, `scope: "uaa.resource"` → caller tưởng token còn hạn/có scope. | Bỏ các field bịa hoặc decode `exp`/`scope` thật từ JWT. |
| I3 | Info | Repudiation | `CloudControllerBase.js:63` | `console.log` trong thư viện mỗi lần `setEndPoint`. | Bỏ hoặc chuyển sang logger tuỳ chọn. |

**Đã kiểm tra, không phải lỗ hổng:**
- `config.json` (chứa credential local) bị `.gitignore` và không có trong lịch sử git. `examples/config.json` từng được commit năm 2015 (`7d089ae`) với password 4 ký tự của tác giả upstream — nhiều khả năng là credential mặc định của CF local; không cần xoá lịch sử, chỉ ghi nhận.
- Không có `eval`, `new Function`, `child_process` trong `lib/`.
- Mật khẩu trong `docs/`, `examples/`, `test/` là giá trị mẫu.

## Các phase sửa

Thứ tự theo mức độ; mỗi phase là một commit/PR riêng, chạy `npm test` + `npm run tsc:check` sau mỗi phase.

### Phase 1 — Critical/High (chặn release tiếp theo)
1. **C1** TLS: thêm `skipSslValidation` (mặc định `false`) và `ca` vào `options` của `CloudControllerBase` → truyền xuống `HttpUtils` (tạo agent theo instance, không còn agent global). Cập nhật `types/index.d.ts`, README, MIGRATION_GUIDE (breaking: endpoint cert tự ký phải bật option).
2. **H1** Xoá `protobufjs`, `ws` khỏi `dependencies`.
3. **H2** Chặn `http:` trừ localhost / `allowInsecureHttp`.
- Test cần thêm: agent mặc định có `rejectUnauthorized !== false`; option bật thì có; `http://api.example.com` bị từ chối, `http://localhost` qua.
- Kiểm tra: `npm audit --omit=dev` không còn critical/high từ `protobufjs`/`ws`.

### Phase 2 — Medium
1. **M1** Nâng `form-data`.
2. **M2** Helper build path có encode segment; thay toàn bộ URL template trong `lib/model/**` (tìm bằng `grep -rn '\${this.API_URL}' lib`). Chuyển `Logs.js:29`, `AppsCopy.js:51` sang `qs`.
3. **M3** Xoá cache khi đổi token/endpoint.
4. **M4** Siết workflow CI.
- Test cần thêm: GUID `../x` được encode thành `..%2Fx`; cache bị xoá sau `setToken`.

### Phase 3 — Low / Info (backlog)
L1 timeout + giới hạn kích thước, L2 escape filter `q`, L3 `getUsers` nhận object, L4 rút gọn error message, L5 `npm audit fix` dev, I1–I3.

### Hoàn tất
- CHANGELOG: mục Security cho từng phase; bump version theo mức (Phase 1 là breaking về TLS → cân nhắc 2.0.0 hoặc minor kèm cảnh báo rõ).
- Chạy lại `npm audit` và `/ck:security` để xác nhận.

## Câu hỏi còn mở
1. C1 là breaking change với người dùng đang trỏ vào CF cert tự ký: bump major (2.0.0) hay minor kèm thông báo?
2. Có muốn validate chặt GUID theo định dạng UUID (M2) không, hay chỉ encode? Validate chặt sẽ chặn sớm hơn nhưng có thể vỡ với CF bản cũ dùng GUID không chuẩn.

## Implementation review — 1.1.0 (2026-11-20)

Owner selected **1.1.0** despite the TLS and remote-HTTP default changes; these are intentionally called out as migration-impacting in README, CHANGELOG and MIGRATION_GUIDE. No npm publish was authorized; `pub:dry` only.

| ID | Decision / user impact |
| --- | --- |
| C1 | Implemented: verify TLS by default with per-instance `skipSslValidation` or custom PEM `ca`; self-signed/private-CA users must configure their clients explicitly. UAA and Logs constructors also accept options. Never use global `NODE_TLS_REJECT_UNAUTHORIZED=0`. |
| H1 | Implemented: removed unused runtime dependencies `protobufjs` and `ws`; consumers relying on undeclared transitive packages must install them themselves. |
| H2 | Implemented: remote HTTP endpoints rejected by default; localhost/127.0.0.1/[::1] continue to work; explicit `allowInsecureHttp` permits legacy setups but exposes credentials on the network. |
| M1 | Implemented: `form-data` upgraded to patched ^4.0.6; no public API change expected. |
| M2 | Implemented narrow URL-template encoding of 143 caller-supplied identifiers in model clients. Raw GUIDs continue to work; previously pre-encoded GUIDs must now be passed raw. Existing v2 filter language is separately tracked in L2. |
| M3 | Implemented: cache cleared on `setToken`/endpoint change; shared-client callers may observe an extra fetch instead of a stale cross-user cache hit. |
| I3 | Implemented: removed console logging of endpoint changes. |
| M4 | Deferred: CI action SHA pinning, secrets scoping and publish provenance change release infrastructure; needs separate review of workflow permissions and pinned SHA sources. No CI change in this release. |
| L1 | Deferred: changing default timeouts/response size limits could break large CF uploads/downloads. Add opt-in controls and streaming tests in a later release. |
| L2/L3 | Deferred: changing v2 filter grammar or the UAA `getUsers` raw query contract would break callers; add safe object overload and deprecation path first. |
| L4 | Deferred: sanitizing error message/body changes the public error contract; add regression tests and migration guidance before altering it. |
| L5 | Deferred: dev-only dependency audit requires a separately verified build/docs toolchain change. |
| I1/I2 | Deferred: warning about unverified `decodeToken` and synthetic API-key token fields remains; do not use decoded claims for authorization. |

Verification status is tracked in `SECURITY-PROGRESS.md`. The pre-existing generated `doc/` HTML is user-owned and has not been staged or overwritten.

### Verification — 1.1.0

- `npm run lint`: pass.
- `npm test`: 178 passing, 1 pre-existing pending.
- `npm run tsc:check`: pass.
- `npm audit --omit=dev`: 0 vulnerabilities (0 critical/high/moderate/low).
- `npm audit` including dev toolchain: 22 remaining (14 high, 8 moderate; L5 backlog).
- `npm run pub:dry`: pass, tarball `cf-node-client-1.1.0.tgz`, 40 package files; dry run did not publish.
- M2 also encodes `ApiVersionManager.buildUrl(resourceId)`; no strict UUID validation (preserves nonstandard CF IDs). Regression test covers path traversal and query delimiter injection. No live Cloud Foundry instance tested.
