# vcf-auto-mcp

VCF Automation(VMware Cloud Foundation Automation)을 Claude Desktop에서 자연어로 제어할 수 있는 MCP(Model Context Protocol) 서버입니다.

## 개요

Claude Desktop과 VCF Automation API를 연결하여 배포 생성, 카탈로그 요청, vRO 워크플로우 실행 등을 대화형으로 처리할 수 있습니다.

- **84개 Tool**, 12개 도메인 지원
- VCF 9.x (VCD 기반) 인증 지원 (Session auth / OAuth2 Refresh Token 자동 전환)
- TypeScript + Zod 입력 검증
- Claude Desktop stdio 방식 연동
- 전 도메인 OpenAPI 스펙 검증 완료

## 지원 도메인

| 도메인 | Tool 수 | 주요 기능 |
|--------|---------|-----------|
| Deployments | 7 | 배포 생성·조회·삭제·Day-2 액션 |
| Catalog | 3 | 카탈로그 아이템 조회·요청 |
| Resources | 4 | 배포 내 리소스 조회·액션 |
| Projects | 5 | 프로젝트 CRUD |
| Blueprints | 7 | 블루프린트 CRUD·검증·버전 관리 |
| Cloud Assembly (IaaS) | 4 | 가상머신·네트워크 조회 |
| ABX | 13 | 액션 CRUD·실행·버전·릴리즈·Secret 관리 |
| Orchestrator Gateway (vRO) | 8 | 워크플로우 실행·상태 폴링·집계 |
| Orchestrator Direct (vRO) | 20 | 워크플로우·액션·카테고리·설정 CRUD + 실행 |
| Governance | 2 | 프로젝트 제약·속성 조회·수정 |
| Approval | 3 | 승인 요청 조회·승인·거부 |
| Custom Resource | 7 | 커스텀 리소스 타입·액션 관리 |

## 요구사항

- Node.js 20 이상
- VCF Automation (VCF 9.x / VCD 기반)
- Claude Desktop

## 설치

```bash
git clone https://github.com/MOONUJ/vcf-auto-mcp.git
cd vcf-auto-mcp
npm install
npm run build
```

## 환경 변수

`.env.example`을 복사하여 `.env`를 생성하고 값을 채웁니다.

```bash
cp .env.example .env
```

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `VCF_BASE_URL` | 필수 | VCF Automation URL (예: `https://vcf.example.com`) |
| `VCF_ORG` | 필수 | 조직명 (예: `poscodx`) |
| `VCF_USERNAME` | 조건부 | 로그인 계정 (Refresh Token 미사용 시 필수) |
| `VCF_PASSWORD` | 조건부 | 로그인 비밀번호 |
| `VCF_REFRESH_TOKEN` | 조건부 | API Refresh Token (username/password 대신 사용 가능) |
| `TOKEN_REFRESH_BUFFER_SECONDS` | 선택 | 토큰 선제 갱신 버퍼 (기본값: `300`) |
| `API_TIMEOUT_MS` | 선택 | API 요청 타임아웃 ms (기본값: `30000`) |
| `API_MAX_RETRIES` | 선택 | 5xx 오류 재시도 횟수 (기본값: `3`) |
| `LOG_LEVEL` | 선택 | 로그 레벨 `error/warn/info/debug` (기본값: `info`) |

## Claude Desktop 연동

### Option 1 — Node.js 직접 실행

`%APPDATA%\Claude\claude_desktop_config.json`에 아래 내용을 추가합니다.

```json
{
  "mcpServers": {
    "vcf-auto-mcp": {
      "command": "node",
      "args": ["C:/path/to/vcf-auto-mcp/dist/index.js"],
      "env": {
        "VCF_BASE_URL": "https://your-vcf-automation-url",
        "VCF_ORG": "your-org-name",
        "VCF_USERNAME": "admin",
        "VCF_PASSWORD": "your-password"
      }
    }
  }
}
```

### Option 2 — Docker

```bash
# 이미지 빌드
docker build -t vcf-auto-mcp:latest .
```

`claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vcf-auto-mcp": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "VCF_BASE_URL=https://your-vcf-automation-url",
        "-e", "VCF_ORG=your-org-name",
        "-e", "VCF_USERNAME=admin",
        "-e", "VCF_PASSWORD=your-password",
        "vcf-auto-mcp:latest"
      ]
    }
  }
}
```

설정 후 Claude Desktop을 **재시작**하면 하단 도구 아이콘에서 연결을 확인할 수 있습니다.

## 개발

```bash
# 개발 모드 (빌드 없이 실행)
npm run dev

# 타입 체크
npm run typecheck

# 빌드
npm run build
```

### 동작 테스트

```bash
# Tool 목록 확인
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js

# 배포 목록 조회
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"vcf_deployment_list","arguments":{}}}' | node dist/index.js
```

### 새 도메인 추가

1. `src/schemas/<domain>.ts` — Zod 입력 스키마 정의
2. `src/api/<domain>.ts` — VCF API 호출 함수
3. `src/tools/<domain>.ts` — MCP tool 핸들러
4. `src/server.ts` — `ALL_TOOLS` 배열에 추가

## 아키텍처

```
src/
├── index.ts          # 진입점 (StdioServerTransport)
├── server.ts         # McpServer + 전체 tool 등록
├── config.ts         # 환경변수 검증 (Zod)
├── auth/
│   └── tokenProvider.ts  # 인메모리 토큰 캐시 + 자동 갱신
├── api/              # 도메인별 VCF API 호출
├── tools/            # 도메인별 MCP tool 핸들러
├── schemas/          # Zod 입력 검증 스키마
└── types/
    └── vcf.ts        # VCF API 응답 타입
```

## 인증 방식

두 가지 인증 방식을 지원하며 자동으로 전환됩니다.

**Mode A — OAuth2 Refresh Token** (`VCF_REFRESH_TOKEN` 설정 시 우선 사용)
```
POST /oauth/tenant/{org}/token
Body: grant_type=refresh_token&refresh_token=<token>
→ access_token: <JWT>
```

**Mode B — VCD Session Auth** (username/password 사용 시 fallback)
```
POST /cloudapi/1.0.0/sessions
Authorization: Basic base64(admin@{org}:{password})
→ x-vmware-vcloud-access-token: <JWT>
```

발급된 토큰은 인메모리에 캐시되며 만료 전 자동으로 갱신됩니다.

## 라이선스

MIT
