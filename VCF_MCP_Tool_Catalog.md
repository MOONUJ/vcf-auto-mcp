이제 전체 Tool 카탈로그를 작성합니다.

---

# VCF Automation MCP Server — 전체 Tool 카탈로그

---

## 공통 스키마 정의

모든 도메인에서 반복되는 파라미터를 공통 스키마로 정의합니다. 각 Tool의 Input Schema에서 `"$ref": "#/components/PaginationParams"` 형태로 참조합니다.

```json
// PaginationParams (공통 참조 스키마)
{
  "$id": "#/components/PaginationParams",
  "type": "object",
  "properties": {
    "$top": {
      "type": "integer",
      "description": "반환할 최대 항목 수 (페이지 크기)",
      "minimum": 1,
      "maximum": 1000,
      "default": 20
    },
    "$skip": {
      "type": "integer",
      "description": "건너뛸 항목 수 (오프셋 기반 페이지네이션)",
      "minimum": 0,
      "default": 0
    },
    "$filter": {
      "type": "string",
      "description": "OData 스타일 필터 표현식 (예: status eq 'CREATE_SUCCESSFUL')",
      "maxLength": 512
    },
    "$orderby": {
      "type": "string",
      "description": "정렬 기준 필드와 방향 (예: 'createdAt desc')",
      "maxLength": 128
    }
  }
}

// UUIDParam (공통 참조 스키마)
{
  "$id": "#/components/UUIDParam",
  "type": "string",
  "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
  "description": "RFC 4122 UUID 형식의 리소스 식별자"
}
```

---

## 전체 Tool 목록 테이블

| # | Tool Name | Domain | Security | Method | 비고 |
|---|-----------|--------|----------|--------|------|
| 1 | `vcf_auth_get_token` | Auth | READ | POST | Refresh Token → Access Token |
| 2 | `vcf_deployment_list` | Deployments | READ | GET | 배포 목록 조회 |
| 3 | `vcf_deployment_get` | Deployments | READ | GET | 단일 배포 상세 조회 |
| 4 | `vcf_deployment_create` | Deployments | WRITE | POST | 블루프린트 배포 (비동기) |
| 5 | `vcf_deployment_update` | Deployments | WRITE | PATCH | 배포 이름/설명 수정 |
| 6 | `vcf_deployment_delete` | Deployments | DESTRUCTIVE | DELETE | 배포 삭제 |
| 7 | `vcf_deployment_get_status` | Deployments | READ | GET | 비동기 요청 상태 폴링 |
| 8 | `vcf_deployment_run_action` | Deployments | WRITE | POST | Day-2 액션 실행 (PowerOff 등) |
| 9 | `vcf_catalog_list_items` | Catalog | READ | GET | 카탈로그 아이템 목록 |
| 10 | `vcf_catalog_get_item` | Catalog | READ | GET | 카탈로그 아이템 상세 |
| 11 | `vcf_catalog_request` | Catalog | WRITE | POST | 카탈로그 아이템 요청 (비동기) |
| 12 | `vcf_catalog_list_requests` | Catalog | READ | GET | 카탈로그 요청 목록 |
| 13 | `vcf_catalog_get_request` | Catalog | READ | GET | 카탈로그 요청 상태 폴링 |
| 14 | `vcf_resource_list` | Resources | READ | GET | 배포 내 리소스 목록 |
| 15 | `vcf_resource_get` | Resources | READ | GET | 단일 리소스 상세 조회 |
| 16 | `vcf_resource_list_actions` | Resources | READ | GET | 리소스 가용 Day-2 액션 목록 |
| 17 | `vcf_resource_run_action` | Resources | WRITE | POST | 리소스 Day-2 액션 실행 |
| 18 | `vcf_project_list` | Projects | READ | GET | 프로젝트 목록 조회 |
| 19 | `vcf_project_get` | Projects | READ | GET | 프로젝트 상세 조회 |
| 20 | `vcf_project_create` | Projects | WRITE | POST | 프로젝트 생성 |
| 21 | `vcf_project_update` | Projects | WRITE | PATCH | 프로젝트 수정 |
| 22 | `vcf_project_delete` | Projects | DESTRUCTIVE | DELETE | 프로젝트 삭제 |
| 23 | `vcf_blueprint_list` | Blueprints | READ | GET | 블루프린트 목록 조회 |
| 24 | `vcf_blueprint_get` | Blueprints | READ | GET | 블루프린트 상세 조회 |
| 25 | `vcf_blueprint_create` | Blueprints | WRITE | POST | 블루프린트 생성 |
| 26 | `vcf_blueprint_update` | Blueprints | WRITE | PUT | 블루프린트 수정 |
| 27 | `vcf_blueprint_delete` | Blueprints | DESTRUCTIVE | DELETE | 블루프린트 삭제 |
| 28 | `vcf_blueprint_validate` | Blueprints | READ | POST | 블루프린트 YAML 유효성 검증 |
| 29 | `vcf_blueprint_list_versions` | Blueprints | READ | GET | 블루프린트 버전 목록 |
| 30 | `vcf_iaas_machine_list` | Cloud Assembly | READ | GET | 가상머신 목록 조회 |
| 31 | `vcf_iaas_machine_get` | Cloud Assembly | READ | GET | 가상머신 상세 조회 |
| 32 | `vcf_iaas_network_list` | Cloud Assembly | READ | GET | 네트워크 목록 조회 |
| 33 | `vcf_iaas_network_get` | Cloud Assembly | READ | GET | 네트워크 상세 조회 |
| 34 | `vcf_abx_action_list` | ABX | READ | GET | ABX 액션 목록 조회 |
| 35 | `vcf_abx_action_get` | ABX | READ | GET | ABX 액션 상세 조회 |
| 36 | `vcf_abx_action_run` | ABX | WRITE | POST | ABX 액션 실행 (비동기) |
| 37 | `vcf_abx_action_get_run` | ABX | READ | GET | ABX 실행 결과 폴링 |
| 38 | `vcf_vro_workflow_list` | Orchestrator | READ | GET | vRO 워크플로우 목록 |
| 39 | `vcf_vro_workflow_get` | Orchestrator | READ | GET | vRO 워크플로우 상세 |
| 40 | `vcf_vro_workflow_execute` | Orchestrator | WRITE | POST | vRO 워크플로우 실행 (비동기) |
| 41 | `vcf_vro_execution_get` | Orchestrator | READ | GET | vRO 실행 상태 폴링 |
| 42 | `vcf_vro_execution_list` | Orchestrator | READ | GET | vRO 실행 이력 조회 |
| 43 | `vcf_governance_get_quota` | Governance | READ | GET | 프로젝트 쿼터 조회 |
| 44 | `vcf_governance_update_quota` | Governance | WRITE | PATCH | 프로젝트 쿼터 수정 |
| 45 | `vcf_approval_list_policies` | Approval | READ | GET | 승인 정책 목록 조회 |
| 46 | `vcf_approval_get_request` | Approval | READ | GET | 승인 대기 요청 조회 |
| 47 | `vcf_approval_decide` | Approval | WRITE | POST | 승인/거부 처리 |

**총 47개 Tool** — READ: 27개, WRITE: 15개, DESTRUCTIVE: 5개

---

## 도메인별 상세 명세

---

## 0. Auth (인증)

### `vcf_auth_get_token`

```
Tool Name: vcf_auth_get_token
Description: VCF Automation API 접근에 필요한 Access Token을 Refresh Token으로부터 발급받는다.
             발급된 토큰은 이후 모든 API 호출의 Authorization 헤더에 사용된다.
API Mapping: POST /oauth/tenant/providerconsumptionorg/token
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["refreshToken"],
  "properties": {
    "refreshToken": {
      "type": "string",
      "format": "password",
      "description": "VCF Automation에서 발급된 API Refresh Token. 절대 로그에 기록되지 않는다.",
      "minLength": 10
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "accessToken": string,   // Bearer 토큰 (만료: 기본 8시간)
  "tokenType": "Bearer",
  "expiresIn": number      // 초 단위 만료 시간
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 요청 형식 또는 빈 refreshToken |
| 401 | Refresh Token 만료 또는 무효 |
| 403 | 해당 테넌트에 접근 권한 없음 |
| 500 | 인증 서버 내부 오류 |

---

## 1. Deployments (배포 관리)

### `vcf_deployment_list`

```
Tool Name: vcf_deployment_list
Description: VCF Automation에 존재하는 배포(Deployment) 목록을 조회한다.
             프로젝트, 상태, 날짜 범위로 필터링할 수 있다.
API Mapping: GET /deployment/api/deployments
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": [],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "특정 프로젝트로 필터링할 프로젝트 UUID"
    },
    "status": {
      "type": "string",
      "enum": [
        "CREATE_SUCCESSFUL", "CREATE_INPROGRESS", "CREATE_FAILED",
        "UPDATE_SUCCESSFUL", "UPDATE_INPROGRESS", "UPDATE_FAILED",
        "DELETE_INPROGRESS", "DELETE_FAILED", "ACTION_INPROGRESS",
        "ACTION_SUCCESSFUL", "ACTION_FAILED"
      ],
      "description": "배포 상태로 필터링"
    },
    "$top":     { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip":    { "$ref": "#/components/PaginationParams/properties/$skip" },
    "$filter":  { "$ref": "#/components/PaginationParams/properties/$filter" },
    "$orderby": { "$ref": "#/components/PaginationParams/properties/$orderby" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string (UUID),
      "name": string,
      "status": string,
      "projectId": string,
      "projectName": string,
      "blueprintId": string,
      "createdAt": string (ISO 8601),
      "createdBy": string,
      "lastUpdatedAt": string
    }
  ],
  "totalElements": number,
  "totalPages": number,
  "pageable": { "pageNumber": number, "pageSize": number }
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | Access Token 만료 또는 누락 |
| 403 | 해당 프로젝트에 대한 읽기 권한 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_deployment_get`

```
Tool Name: vcf_deployment_get
Description: 특정 배포의 상세 정보(상태, 리소스 요약, 입력 파라미터, 오류 메시지 등)를 조회한다.
API Mapping: GET /deployment/api/deployments/{deploymentId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["deploymentId"],
  "properties": {
    "deploymentId": {
      "$ref": "#/components/UUIDParam",
      "description": "조회할 배포의 UUID"
    },
    "expandResources": {
      "type": "boolean",
      "description": "true이면 응답에 리소스 목록을 포함하여 반환",
      "default": false
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "description": string,
  "status": string,
  "projectId": string,
  "projectName": string,
  "blueprintId": string,
  "blueprintVersion": string,
  "inputs": object,          // 배포 시 사용된 입력 파라미터
  "resources": object[],     // expandResources=true 시 포함
  "expense": {
    "totalExpense": number,
    "unit": string
  },
  "createdAt": string,
  "createdBy": string,
  "lastUpdatedAt": string,
  "lastAction": {
    "actionId": string,
    "name": string,
    "status": string,
    "startedAt": string,
    "finishedAt": string,
    "failureMessage": string
  }
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 토큰 오류 |
| 403 | 해당 배포에 대한 접근 권한 없음 |
| 404 | 배포 ID가 존재하지 않음 |
| 500 | 서버 내부 오류 |

---

### `vcf_deployment_create`

```
Tool Name: vcf_deployment_create
Description: 블루프린트를 기반으로 새 배포를 생성한다. 비동기 작업이며 deploymentId와
             requestTrackerUrl을 반환한다. 완료 여부는 vcf_deployment_get_status로 폴링한다.
API Mapping: POST /deployment/api/deployments
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["projectId", "deploymentName", "blueprintId"],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "배포가 속할 프로젝트 UUID"
    },
    "deploymentName": {
      "type": "string",
      "description": "배포 이름 (조직 내 고유해야 함)",
      "minLength": 1,
      "maxLength": 256,
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9\\-_\\s]*$"
    },
    "description": {
      "type": "string",
      "description": "배포에 대한 자유 형식 설명",
      "maxLength": 1024
    },
    "blueprintId": {
      "$ref": "#/components/UUIDParam",
      "description": "배포할 블루프린트 UUID"
    },
    "blueprintVersion": {
      "type": "string",
      "description": "배포할 블루프린트 버전. 미지정 시 최신(released) 버전 사용",
      "maxLength": 64
    },
    "inputs": {
      "type": "object",
      "description": "블루프린트 입력 파라미터 키-값 맵. 스키마는 blueprint에 따라 가변",
      "additionalProperties": true
    },
    "reason": {
      "type": "string",
      "description": "배포 요청 사유 (승인 워크플로우에 전달됨)",
      "maxLength": 512
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "deploymentId": string (UUID),   // 생성된 배포 ID
  "requestId": string (UUID),      // 비동기 요청 추적 ID → vcf_deployment_get_status에 사용
  "status": "CREATE_INPROGRESS",
  "requestTrackerUrl": string      // 상태 폴링 URL
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 필수 파라미터 누락 또는 inputs 스키마 불일치 |
| 401 | 인증 오류 |
| 403 | 프로젝트 배포 권한 없음 또는 쿼터 초과 |
| 404 | blueprintId가 존재하지 않거나 해당 버전 없음 |
| 409 | 동일 이름의 배포가 이미 존재함 |
| 422 | 블루프린트 유효성 검증 실패 |
| 500 | 서버 내부 오류 |

---

### `vcf_deployment_update`

```
Tool Name: vcf_deployment_update
Description: 기존 배포의 이름, 설명, 또는 입력 파라미터를 수정한다.
             입력 파라미터 변경 시 Day-2 Update 액션이 트리거된다. 비동기 작업이다.
API Mapping: PATCH /deployment/api/deployments/{deploymentId}
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["deploymentId"],
  "properties": {
    "deploymentId": {
      "$ref": "#/components/UUIDParam",
      "description": "수정할 배포의 UUID"
    },
    "name": {
      "type": "string",
      "description": "변경할 배포 이름",
      "minLength": 1,
      "maxLength": 256
    },
    "description": {
      "type": "string",
      "description": "변경할 배포 설명",
      "maxLength": 1024
    },
    "inputs": {
      "type": "object",
      "description": "변경할 입력 파라미터. 지정된 키만 업데이트되며 나머지는 유지됨",
      "additionalProperties": true
    },
    "reason": {
      "type": "string",
      "description": "변경 사유",
      "maxLength": 512
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "requestId": string (UUID),
  "status": "UPDATE_INPROGRESS"
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 파라미터 형식 |
| 401 | 인증 오류 |
| 403 | 수정 권한 없음 |
| 404 | 배포 ID 없음 |
| 409 | 이미 다른 작업이 진행 중 (상태가 INPROGRESS) |
| 500 | 서버 내부 오류 |

---

### `vcf_deployment_delete`

```
Tool Name: vcf_deployment_delete
Description: 배포와 해당 배포의 모든 프로비저닝된 리소스를 삭제한다.
             되돌릴 수 없는 작업이므로 dryRun=true로 먼저 영향 범위를 확인할 것을 강권한다.
             삭제 전 dependent 리소스 목록이 응답에 포함된다.
API Mapping: DELETE /deployment/api/deployments/{deploymentId}
Security Classification: DESTRUCTIVE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["deploymentId", "dryRun"],
  "properties": {
    "deploymentId": {
      "$ref": "#/components/UUIDParam",
      "description": "삭제할 배포의 UUID"
    },
    "dryRun": {
      "type": "boolean",
      "description": "true이면 실제 삭제 없이 영향 받는 리소스 목록만 반환. 반드시 false로 명시해야 실제 삭제 실행",
      "default": true
    },
    "forceDelete": {
      "type": "boolean",
      "description": "true이면 리소스 삭제 실패 시에도 배포 레코드를 강제 제거. 고아 리소스 발생 가능",
      "default": false
    },
    "reason": {
      "type": "string",
      "description": "삭제 사유 (감사 로그에 기록됨)",
      "minLength": 5,
      "maxLength": 512
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
// dryRun=true:
{
  "dryRun": true,
  "affectedResources": [
    { "id": string, "name": string, "type": string, "status": string }
  ],
  "totalAffectedCount": number,
  "warningMessages": string[]
}

// dryRun=false:
{
  "requestId": string (UUID),
  "status": "DELETE_INPROGRESS",
  "deploymentId": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 삭제 권한 없음 또는 승인 필요 |
| 404 | 배포 ID 없음 |
| 409 | 다른 작업 진행 중 |
| 500 | 서버 내부 오류 |

> **롤백 전략:** 삭제 후 복구 불가. 삭제 전 `vcf_deployment_get`으로 inputs를 백업하고, 동일 블루프린트로 재배포 가능한지 확인할 것.

---

### `vcf_deployment_get_status`

```
Tool Name: vcf_deployment_get_status
Description: vcf_deployment_create / vcf_deployment_delete 등의 비동기 작업 요청 결과를 폴링한다.
             status가 INPROGRESS인 동안 반복 호출하며, 완료 또는 실패 시 상세 결과를 반환한다.
API Mapping: GET /deployment/api/deployments/{deploymentId}/requests/{requestId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["deploymentId", "requestId"],
  "properties": {
    "deploymentId": {
      "$ref": "#/components/UUIDParam",
      "description": "배포 UUID"
    },
    "requestId": {
      "$ref": "#/components/UUIDParam",
      "description": "비동기 요청 UUID (생성/삭제/업데이트 호출 시 반환됨)"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "deploymentId": string,
  "requestType": "CREATE" | "UPDATE" | "DELETE" | "DAY2_ACTION",
  "status": "PENDING" | "INPROGRESS" | "SUCCESSFUL" | "FAILED",
  "progress": number,          // 0-100 진행률
  "startedAt": string,
  "finishedAt": string,
  "failureMessage": string,    // 실패 시 오류 상세
  "resourceChanges": [
    { "resourceId": string, "resourceName": string, "changeType": string }
  ]
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 404 | deploymentId 또는 requestId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_deployment_run_action`

```
Tool Name: vcf_deployment_run_action
Description: 배포 레벨 Day-2 액션(예: PowerOff, Resize, ChangeOwner)을 실행한다.
             실행 가능한 액션 목록은 배포 상태에 따라 가변적이다. 비동기 작업이다.
API Mapping: POST /deployment/api/deployments/{deploymentId}/requests
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["deploymentId", "actionId"],
  "properties": {
    "deploymentId": {
      "$ref": "#/components/UUIDParam",
      "description": "액션을 실행할 배포 UUID"
    },
    "actionId": {
      "type": "string",
      "description": "실행할 Day-2 액션 ID (예: 'Deployment.PowerOff', 'Deployment.Update')",
      "minLength": 1,
      "maxLength": 256
    },
    "inputs": {
      "type": "object",
      "description": "액션별 입력 파라미터. 각 액션의 스키마는 리소스 액션 명세 참조",
      "additionalProperties": true
    },
    "reason": {
      "type": "string",
      "description": "액션 실행 사유",
      "maxLength": 512
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "requestId": string (UUID),
  "deploymentId": string,
  "actionId": string,
  "status": "ACTION_INPROGRESS"
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 actionId 또는 inputs 스키마 불일치 |
| 401 | 인증 오류 |
| 403 | 해당 액션 실행 권한 없음 |
| 404 | 배포 또는 액션 없음 |
| 409 | 이미 진행 중인 작업 있음 |
| 500 | 서버 내부 오류 |

---

## 2. Catalog (서비스 카탈로그)

### `vcf_catalog_list_items`

```
Tool Name: vcf_catalog_list_items
Description: 현재 사용자가 요청 가능한 카탈로그 아이템 목록을 조회한다.
             프로젝트 범위 내에서 승인된 항목만 표시된다.
API Mapping: GET /catalog/api/items
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": [],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "특정 프로젝트의 카탈로그 아이템만 조회"
    },
    "search": {
      "type": "string",
      "description": "카탈로그 아이템 이름 전문 검색",
      "maxLength": 256
    },
    "includeFormDefinition": {
      "type": "boolean",
      "description": "true이면 요청 폼 스키마(입력 파라미터 정의) 포함 반환",
      "default": false
    },
    "$top":     { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip":    { "$ref": "#/components/PaginationParams/properties/$skip" },
    "$filter":  { "$ref": "#/components/PaginationParams/properties/$filter" },
    "$orderby": { "$ref": "#/components/PaginationParams/properties/$orderby" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string (UUID),
      "name": string,
      "description": string,
      "type": { "id": string, "name": string },
      "iconId": string,
      "projectIds": string[],
      "createdAt": string,
      "createdBy": string,
      "formDefinition": object   // includeFormDefinition=true 시 포함
    }
  ],
  "totalElements": number,
  "totalPages": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 카탈로그 접근 권한 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_catalog_get_item`

```
Tool Name: vcf_catalog_get_item
Description: 특정 카탈로그 아이템의 상세 정보와 요청 폼 스키마를 조회한다.
             요청 전 입력 파라미터 구조를 확인하는 용도로 사용한다.
API Mapping: GET /catalog/api/items/{itemId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["itemId"],
  "properties": {
    "itemId": {
      "$ref": "#/components/UUIDParam",
      "description": "조회할 카탈로그 아이템 UUID"
    },
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "프로젝트 컨텍스트. 프로젝트별 폼 커스터마이징 반영을 위해 지정"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "description": string,
  "type": { "id": string, "name": string },
  "schema": {
    "properties": object,   // 입력 파라미터 JSON Schema
    "required": string[]
  },
  "sourceId": string,       // 연결된 blueprint/template ID
  "sourceType": string,
  "entitledActions": string[]
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | 카탈로그 아이템 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_catalog_request`

```
Tool Name: vcf_catalog_request
Description: 카탈로그 아이템을 요청하여 배포를 시작한다. 승인 정책이 연결된 경우 승인 후 배포된다.
             비동기 작업이며 requestId를 반환한다. 상태는 vcf_catalog_get_request로 폴링한다.
API Mapping: POST /catalog/api/requests
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["catalogItemId", "projectId", "deploymentName"],
  "properties": {
    "catalogItemId": {
      "$ref": "#/components/UUIDParam",
      "description": "요청할 카탈로그 아이템 UUID"
    },
    "catalogItemVersion": {
      "type": "string",
      "description": "요청할 카탈로그 아이템 버전. 미지정 시 최신 버전",
      "maxLength": 64
    },
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "배포가 생성될 프로젝트 UUID"
    },
    "deploymentName": {
      "type": "string",
      "description": "생성될 배포 이름",
      "minLength": 1,
      "maxLength": 256,
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9\\-_\\s]*$"
    },
    "description": {
      "type": "string",
      "description": "요청 설명",
      "maxLength": 1024
    },
    "inputs": {
      "type": "object",
      "description": "카탈로그 아이템 폼 입력값. 스키마는 vcf_catalog_get_item 참조",
      "additionalProperties": true
    },
    "reason": {
      "type": "string",
      "description": "요청 사유 (승인자에게 전달됨)",
      "maxLength": 512
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "requestId": string (UUID),
  "deploymentId": string,      // 승인 전에도 배포 ID 예약됨
  "catalogItemId": string,
  "status": "PENDING_APPROVAL" | "IN_PROGRESS",
  "approvalRequired": boolean
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | inputs 스키마 검증 실패 |
| 401 | 인증 오류 |
| 403 | 카탈로그 아이템 요청 권한 없음 |
| 404 | catalogItemId 없음 |
| 409 | 동일 이름 배포 이미 존재 |
| 422 | 유효성 검증 실패 |
| 500 | 서버 내부 오류 |

---

### `vcf_catalog_list_requests`

```
Tool Name: vcf_catalog_list_requests
Description: 카탈로그 요청 이력 목록을 조회한다. 현재 사용자 또는 전체 프로젝트 요청을 조회할 수 있다.
API Mapping: GET /catalog/api/requests
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": [],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "특정 프로젝트의 요청만 조회"
    },
    "status": {
      "type": "string",
      "enum": ["PENDING_APPROVAL", "IN_PROGRESS", "SUCCESSFUL", "FAILED", "CANCELLED", "REJECTED"],
      "description": "요청 상태로 필터링"
    },
    "requestedBy": {
      "type": "string",
      "description": "요청자 사용자명으로 필터링",
      "maxLength": 256
    },
    "$top":     { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip":    { "$ref": "#/components/PaginationParams/properties/$skip" },
    "$filter":  { "$ref": "#/components/PaginationParams/properties/$filter" },
    "$orderby": { "$ref": "#/components/PaginationParams/properties/$orderby" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string,
      "deploymentId": string,
      "deploymentName": string,
      "catalogItemId": string,
      "catalogItemName": string,
      "status": string,
      "requestedBy": string,
      "requestedAt": string,
      "completedAt": string
    }
  ],
  "totalElements": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 조회 권한 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_catalog_get_request`

```
Tool Name: vcf_catalog_get_request
Description: 카탈로그 요청의 현재 상태와 승인 대기 정보를 조회한다.
             vcf_catalog_request 실행 후 완료 폴링에 사용한다.
API Mapping: GET /catalog/api/requests/{requestId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["requestId"],
  "properties": {
    "requestId": {
      "$ref": "#/components/UUIDParam",
      "description": "폴링할 카탈로그 요청 UUID"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "status": "PENDING_APPROVAL" | "IN_PROGRESS" | "SUCCESSFUL" | "FAILED" | "CANCELLED" | "REJECTED",
  "deploymentId": string,
  "deploymentName": string,
  "approvalStatus": {
    "status": string,
    "policyId": string,
    "policyName": string,
    "approvers": string[],
    "approvedBy": string,
    "approvedAt": string,
    "rejectionReason": string
  },
  "failureMessage": string,
  "requestedAt": string,
  "completedAt": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 404 | requestId 없음 |
| 500 | 서버 내부 오류 |

---

## 3. Resources (배포 내 리소스)

### `vcf_resource_list`

```
Tool Name: vcf_resource_list
Description: 특정 배포에 속한 프로비저닝된 리소스(VM, 네트워크, 디스크 등) 목록을 조회한다.
API Mapping: GET /deployment/api/resources
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["deploymentId"],
  "properties": {
    "deploymentId": {
      "$ref": "#/components/UUIDParam",
      "description": "리소스를 조회할 배포 UUID"
    },
    "resourceType": {
      "type": "string",
      "description": "리소스 타입 필터 (예: 'Cloud.vSphere.Machine', 'Cloud.Network')",
      "maxLength": 128
    },
    "$top":     { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip":    { "$ref": "#/components/PaginationParams/properties/$skip" },
    "$filter":  { "$ref": "#/components/PaginationParams/properties/$filter" },
    "$orderby": { "$ref": "#/components/PaginationParams/properties/$orderby" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string,
      "name": string,
      "type": string,
      "status": string,
      "deploymentId": string,
      "properties": object,   // 리소스 타입별 속성 (IP, CPU, Memory 등)
      "createdAt": string,
      "syncStatus": string
    }
  ],
  "totalElements": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | deploymentId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_resource_get`

```
Tool Name: vcf_resource_get
Description: 개별 리소스의 상세 속성, 현재 상태, 비용 정보를 조회한다.
API Mapping: GET /deployment/api/resources/{resourceId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["resourceId"],
  "properties": {
    "resourceId": {
      "$ref": "#/components/UUIDParam",
      "description": "조회할 리소스 UUID"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "type": string,
  "status": string,
  "deploymentId": string,
  "projectId": string,
  "properties": {
    // Cloud.vSphere.Machine 예시:
    "address": string,
    "cpuCount": number,
    "memoryInMB": number,
    "powerState": string,
    "storage": object[]
  },
  "expense": { "totalExpense": number, "unit": string },
  "createdAt": string,
  "lastUpdatedAt": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | resourceId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_resource_list_actions`

```
Tool Name: vcf_resource_list_actions
Description: 특정 리소스에서 현재 실행 가능한 Day-2 액션 목록과 각 액션의 입력 스키마를 조회한다.
             vcf_resource_run_action 호출 전에 사용한다.
API Mapping: GET /deployment/api/resources/{resourceId}/actions
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["resourceId"],
  "properties": {
    "resourceId": {
      "$ref": "#/components/UUIDParam",
      "description": "액션 목록을 조회할 리소스 UUID"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "actions": [
    {
      "id": string,
      "name": string,
      "displayName": string,
      "description": string,
      "schema": {
        "properties": object,
        "required": string[]
      },
      "valid": boolean,       // 현재 상태에서 실행 가능 여부
      "validationMessage": string
    }
  ]
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | resourceId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_resource_run_action`

```
Tool Name: vcf_resource_run_action
Description: 리소스 레벨 Day-2 액션(예: PowerOff, Snapshot, Resize)을 실행한다.
             비동기 작업이며 requestId를 반환한다.
API Mapping: POST /deployment/api/resources/{resourceId}/requests
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["resourceId", "actionId"],
  "properties": {
    "resourceId": {
      "$ref": "#/components/UUIDParam",
      "description": "액션을 실행할 리소스 UUID"
    },
    "actionId": {
      "type": "string",
      "description": "실행할 Day-2 액션 ID. vcf_resource_list_actions로 확인",
      "minLength": 1,
      "maxLength": 256
    },
    "inputs": {
      "type": "object",
      "description": "액션별 입력 파라미터",
      "additionalProperties": true
    },
    "reason": {
      "type": "string",
      "description": "액션 실행 사유",
      "maxLength": 512
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "requestId": string,
  "resourceId": string,
  "actionId": string,
  "status": "INPROGRESS"
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 actionId 또는 inputs |
| 401 | 인증 오류 |
| 403 | 액션 실행 권한 없음 |
| 404 | resourceId 또는 actionId 없음 |
| 409 | 리소스가 이미 다른 작업 진행 중 |
| 500 | 서버 내부 오류 |

---

## 4. Projects (프로젝트 관리)

### `vcf_project_list`

```
Tool Name: vcf_project_list
Description: 현재 사용자가 접근 가능한 프로젝트 목록을 조회한다.
API Mapping: GET /iaas/api/projects
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": [],
  "properties": {
    "$top":     { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip":    { "$ref": "#/components/PaginationParams/properties/$skip" },
    "$filter":  { "$ref": "#/components/PaginationParams/properties/$filter" },
    "$orderby": { "$ref": "#/components/PaginationParams/properties/$orderby" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string,
      "name": string,
      "description": string,
      "administrators": [{ "email": string }],
      "members": [{ "email": string }],
      "viewers": [{ "email": string }],
      "constraints": object,
      "properties": object,
      "operationTimeout": number,
      "sharedResources": boolean
    }
  ],
  "totalElements": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 프로젝트 목록 조회 권한 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_project_get`

```
Tool Name: vcf_project_get
Description: 특정 프로젝트의 상세 정보(구성원, 클라우드 존 매핑, 제약사항)를 조회한다.
API Mapping: GET /iaas/api/projects/{projectId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["projectId"],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "조회할 프로젝트 UUID"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "description": string,
  "administrators": [{ "email": string, "type": string }],
  "members": [{ "email": string, "type": string }],
  "viewers": [{ "email": string, "type": string }],
  "zoneAssignmentConfigurations": [
    {
      "zoneId": string,
      "zoneName": string,
      "priority": number,
      "cpuLimit": number,
      "memoryLimitMB": number,
      "storageLimitGB": number,
      "maxNumberInstances": number
    }
  ],
  "constraints": object,
  "operationTimeout": number,
  "sharedResources": boolean
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 프로젝트 접근 권한 없음 |
| 404 | projectId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_project_create`

```
Tool Name: vcf_project_create
Description: 새 프로젝트를 생성하고 초기 구성원과 클라우드 존을 설정한다.
API Mapping: POST /iaas/api/projects
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": {
      "type": "string",
      "description": "프로젝트 이름 (조직 내 고유)",
      "minLength": 1,
      "maxLength": 256,
      "pattern": "^[a-zA-Z0-9][a-zA-Z0-9\\-_\\s]*$"
    },
    "description": {
      "type": "string",
      "description": "프로젝트 설명",
      "maxLength": 1024
    },
    "administrators": {
      "type": "array",
      "description": "관리자로 지정할 사용자 이메일 목록",
      "items": {
        "type": "object",
        "required": ["email"],
        "properties": {
          "email": { "type": "string", "format": "email" },
          "type": { "type": "string", "enum": ["user", "group"], "default": "user" }
        }
      }
    },
    "members": {
      "type": "array",
      "description": "멤버로 지정할 사용자 이메일 목록",
      "items": {
        "type": "object",
        "required": ["email"],
        "properties": {
          "email": { "type": "string", "format": "email" },
          "type": { "type": "string", "enum": ["user", "group"], "default": "user" }
        }
      }
    },
    "operationTimeout": {
      "type": "integer",
      "description": "작업 타임아웃 (초). 기본 0은 글로벌 설정 사용",
      "minimum": 0,
      "maximum": 86400
    },
    "sharedResources": {
      "type": "boolean",
      "description": "true이면 프로젝트 구성원 간 리소스 공유 허용",
      "default": true
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "description": string,
  "_links": { "self": { "href": string } }
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 파라미터 |
| 401 | 인증 오류 |
| 403 | 프로젝트 생성 권한 없음 (Cloud Admin 이상 필요) |
| 409 | 동일 이름 프로젝트 이미 존재 |
| 500 | 서버 내부 오류 |

---

### `vcf_project_update`

```
Tool Name: vcf_project_update
Description: 프로젝트 구성원, 설명, 클라우드 존 할당, 운영 타임아웃을 수정한다.
API Mapping: PATCH /iaas/api/projects/{projectId}
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["projectId"],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "수정할 프로젝트 UUID"
    },
    "description": {
      "type": "string",
      "maxLength": 1024,
      "description": "변경할 프로젝트 설명"
    },
    "administrators": {
      "type": "array",
      "description": "새 관리자 목록 (기존 목록 전체 교체)",
      "items": {
        "type": "object",
        "properties": {
          "email": { "type": "string", "format": "email" },
          "type": { "type": "string", "enum": ["user", "group"] }
        }
      }
    },
    "members": {
      "type": "array",
      "description": "새 멤버 목록 (기존 목록 전체 교체)",
      "items": {
        "type": "object",
        "properties": {
          "email": { "type": "string", "format": "email" },
          "type": { "type": "string", "enum": ["user", "group"] }
        }
      }
    },
    "operationTimeout": {
      "type": "integer",
      "minimum": 0,
      "maximum": 86400,
      "description": "작업 타임아웃 (초)"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "description": string,
  "lastUpdatedAt": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 파라미터 |
| 401 | 인증 오류 |
| 403 | 수정 권한 없음 |
| 404 | projectId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_project_delete`

```
Tool Name: vcf_project_delete
Description: 프로젝트를 삭제한다. 프로젝트 내 활성 배포가 존재하면 삭제가 거부된다.
             dryRun=true로 먼저 삭제 가능 여부와 영향 범위를 확인할 것을 강권한다.
API Mapping: DELETE /iaas/api/projects/{projectId}
Security Classification: DESTRUCTIVE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["projectId", "dryRun"],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "삭제할 프로젝트 UUID"
    },
    "dryRun": {
      "type": "boolean",
      "description": "true이면 실제 삭제 없이 차단 조건(활성 배포 수, 멤버 수)만 반환",
      "default": true
    },
    "reason": {
      "type": "string",
      "description": "삭제 사유 (감사 로그에 기록됨)",
      "minLength": 5,
      "maxLength": 512
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
// dryRun=true:
{
  "dryRun": true,
  "canDelete": boolean,
  "blockers": [
    { "reason": string, "count": number, "resourceType": string }
  ],
  "memberCount": number,
  "activeDeploymentCount": number
}

// dryRun=false, 성공:
{
  "status": "DELETED",
  "projectId": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 삭제 권한 없음 (Cloud Admin 필요) |
| 404 | projectId 없음 |
| 409 | 활성 배포 또는 리소스 잔존으로 삭제 불가 |
| 500 | 서버 내부 오류 |

> **롤백 전략:** 프로젝트 삭제는 되돌릴 수 없음. 삭제 전 모든 배포를 먼저 `vcf_deployment_delete`로 제거하고, 구성원 목록을 별도 백업할 것.

---

## 5. Blueprints (블루프린트)

### `vcf_blueprint_list`

```
Tool Name: vcf_blueprint_list
Description: 접근 가능한 블루프린트 목록을 조회한다. 프로젝트 또는 공유 상태로 필터링 가능하다.
API Mapping: GET /blueprint/api/blueprints
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": [],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "특정 프로젝트의 블루프린트만 조회"
    },
    "status": {
      "type": "string",
      "enum": ["DRAFT", "VERSIONED", "RELEASED"],
      "description": "블루프린트 상태로 필터링"
    },
    "requestScopeOrg": {
      "type": "boolean",
      "description": "true이면 조직 전체 공유 블루프린트 포함 조회",
      "default": false
    },
    "$top":     { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip":    { "$ref": "#/components/PaginationParams/properties/$skip" },
    "$filter":  { "$ref": "#/components/PaginationParams/properties/$filter" },
    "$orderby": { "$ref": "#/components/PaginationParams/properties/$orderby" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string,
      "name": string,
      "description": string,
      "status": "DRAFT" | "VERSIONED" | "RELEASED",
      "projectId": string,
      "projectName": string,
      "createdAt": string,
      "createdBy": string,
      "updatedAt": string,
      "selfLink": string
    }
  ],
  "totalElements": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 조회 권한 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_blueprint_get`

```
Tool Name: vcf_blueprint_get
Description: 특정 블루프린트의 YAML 콘텐츠, 입력 파라미터 스키마, 버전 정보를 조회한다.
API Mapping: GET /blueprint/api/blueprints/{blueprintId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["blueprintId"],
  "properties": {
    "blueprintId": {
      "$ref": "#/components/UUIDParam",
      "description": "조회할 블루프린트 UUID"
    },
    "version": {
      "type": "string",
      "description": "특정 버전 조회. 미지정 시 현재(latest) 버전",
      "maxLength": 64
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "description": string,
  "status": string,
  "content": string,    // YAML 형식의 블루프린트 콘텐츠 전문
  "version": string,
  "inputs": object,     // 입력 파라미터 JSON Schema
  "projectId": string,
  "createdAt": string,
  "createdBy": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | blueprintId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_blueprint_create`

```
Tool Name: vcf_blueprint_create
Description: 새 블루프린트를 생성하거나 기존 YAML을 임포트한다.
             생성 직후 상태는 DRAFT이며, 배포 가능하려면 RELEASED 상태 전환이 필요하다.
API Mapping: POST /blueprint/api/blueprints
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["name", "projectId", "content"],
  "properties": {
    "name": {
      "type": "string",
      "description": "블루프린트 이름 (프로젝트 내 고유)",
      "minLength": 1,
      "maxLength": 256
    },
    "description": {
      "type": "string",
      "description": "블루프린트 설명",
      "maxLength": 1024
    },
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "블루프린트가 속할 프로젝트 UUID"
    },
    "content": {
      "type": "string",
      "description": "Cloud Template YAML 콘텐츠. 최소 'formatVersion: 1' 포함 필요",
      "minLength": 10
    },
    "requestScopeOrg": {
      "type": "boolean",
      "description": "true이면 조직 전체에서 사용 가능한 공유 블루프린트로 설정",
      "default": false
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "status": "DRAFT",
  "projectId": string,
  "createdAt": string,
  "selfLink": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 YAML 형식 |
| 401 | 인증 오류 |
| 403 | 블루프린트 생성 권한 없음 |
| 409 | 동일 이름 블루프린트 이미 존재 |
| 422 | YAML 유효성 검증 실패 (리소스 타입 오류 등) |
| 500 | 서버 내부 오류 |

---

### `vcf_blueprint_update`

```
Tool Name: vcf_blueprint_update
Description: 기존 블루프린트의 YAML 콘텐츠, 이름, 설명을 수정한다.
             RELEASED 상태의 블루프린트는 수정 시 새 버전이 생성된다.
API Mapping: PUT /blueprint/api/blueprints/{blueprintId}
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["blueprintId"],
  "properties": {
    "blueprintId": {
      "$ref": "#/components/UUIDParam",
      "description": "수정할 블루프린트 UUID"
    },
    "name": {
      "type": "string",
      "description": "변경할 블루프린트 이름",
      "minLength": 1,
      "maxLength": 256
    },
    "description": {
      "type": "string",
      "description": "변경할 설명",
      "maxLength": 1024
    },
    "content": {
      "type": "string",
      "description": "변경할 Cloud Template YAML 전문",
      "minLength": 10
    },
    "requestScopeOrg": {
      "type": "boolean",
      "description": "조직 공유 범위 변경"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "status": string,
  "version": string,
  "updatedAt": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 YAML |
| 401 | 인증 오류 |
| 403 | 수정 권한 없음 |
| 404 | blueprintId 없음 |
| 422 | YAML 유효성 검증 실패 |
| 500 | 서버 내부 오류 |

---

### `vcf_blueprint_delete`

```
Tool Name: vcf_blueprint_delete
Description: 블루프린트를 삭제한다. 해당 블루프린트로 생성된 활성 배포가 있으면 삭제 불가.
             dryRun=true로 먼저 연결된 배포 수를 확인할 것을 강권한다.
API Mapping: DELETE /blueprint/api/blueprints/{blueprintId}
Security Classification: DESTRUCTIVE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["blueprintId", "dryRun"],
  "properties": {
    "blueprintId": {
      "$ref": "#/components/UUIDParam",
      "description": "삭제할 블루프린트 UUID"
    },
    "dryRun": {
      "type": "boolean",
      "description": "true이면 연결된 배포 수와 버전 목록만 반환하고 실제 삭제하지 않음",
      "default": true
    },
    "reason": {
      "type": "string",
      "description": "삭제 사유",
      "minLength": 5,
      "maxLength": 512
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
// dryRun=true:
{
  "dryRun": true,
  "canDelete": boolean,
  "activeDeploymentCount": number,
  "versions": [{ "id": string, "version": string, "status": string }]
}

// dryRun=false:
{ "status": "DELETED", "blueprintId": string }
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 삭제 권한 없음 |
| 404 | blueprintId 없음 |
| 409 | 활성 배포 존재로 삭제 불가 |
| 500 | 서버 내부 오류 |

---

### `vcf_blueprint_validate`

```
Tool Name: vcf_blueprint_validate
Description: 블루프린트 YAML 콘텐츠를 실제 배포 없이 문법 및 의미론적으로 검증한다.
             클라우드 존 가용성, 리소스 타입 유효성, 입력 파라미터 스키마 정합성을 확인한다.
API Mapping: POST /blueprint/api/blueprints/validate-from-yaml
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["projectId", "content"],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "유효성 검증에 사용할 프로젝트 컨텍스트 UUID"
    },
    "content": {
      "type": "string",
      "description": "검증할 Cloud Template YAML 콘텐츠 전문",
      "minLength": 10
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "valid": boolean,
  "messages": [
    {
      "type": "ERROR" | "WARNING" | "INFO",
      "message": string,
      "resourceName": string,   // 오류가 발생한 리소스 블록
      "path": string            // YAML 경로 (예: "resources.vm1.properties.image")
    }
  ]
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | YAML 파싱 불가 |
| 401 | 인증 오류 |
| 403 | 검증 권한 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_blueprint_list_versions`

```
Tool Name: vcf_blueprint_list_versions
Description: 특정 블루프린트의 버전 이력 목록을 조회한다.
API Mapping: GET /blueprint/api/blueprints/{blueprintId}/versions
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["blueprintId"],
  "properties": {
    "blueprintId": {
      "$ref": "#/components/UUIDParam",
      "description": "버전 목록을 조회할 블루프린트 UUID"
    },
    "$top":  { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip": { "$ref": "#/components/PaginationParams/properties/$skip" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string,
      "version": string,
      "description": string,
      "status": "DRAFT" | "VERSIONED" | "RELEASED",
      "createdAt": string,
      "createdBy": string
    }
  ],
  "totalElements": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 404 | blueprintId 없음 |
| 500 | 서버 내부 오류 |

---

## 6. Cloud Assembly — IaaS

### `vcf_iaas_machine_list`

```
Tool Name: vcf_iaas_machine_list
Description: IaaS 레이어에서 프로비저닝된 가상머신 목록을 조회한다.
             배포와 무관하게 클라우드 전체 VM 인벤토리를 확인할 때 사용한다.
API Mapping: GET /iaas/api/machines
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": [],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "특정 프로젝트의 VM만 조회"
    },
    "powerState": {
      "type": "string",
      "enum": ["ON", "OFF", "SUSPEND", "UNKNOWN"],
      "description": "전원 상태로 필터링"
    },
    "$top":     { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip":    { "$ref": "#/components/PaginationParams/properties/$skip" },
    "$filter":  { "$ref": "#/components/PaginationParams/properties/$filter" },
    "$orderby": { "$ref": "#/components/PaginationParams/properties/$orderby" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string,
      "name": string,
      "powerState": string,
      "address": string,
      "projectId": string,
      "deploymentId": string,
      "cpuCount": number,
      "memoryInMB": number,
      "cloudAccountIds": string[],
      "tags": [{ "key": string, "value": string }],
      "createdAt": string
    }
  ],
  "totalElements": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_iaas_machine_get`

```
Tool Name: vcf_iaas_machine_get
Description: 특정 VM의 상세 스펙, 네트워크 인터페이스, 디스크, 태그 정보를 조회한다.
API Mapping: GET /iaas/api/machines/{machineId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["machineId"],
  "properties": {
    "machineId": {
      "$ref": "#/components/UUIDParam",
      "description": "조회할 VM UUID"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "powerState": string,
  "address": string,
  "osType": string,
  "hardwareConfig": { "cpuCount": number, "memoryInMB": number },
  "bootConfig": { "content": string },
  "storages": [
    { "name": string, "capacityInGB": number, "type": string }
  ],
  "nics": [
    { "name": string, "ipAddresses": string[], "networkId": string, "macAddress": string }
  ],
  "tags": [{ "key": string, "value": string }],
  "cloudAccountIds": string[],
  "deploymentId": string,
  "projectId": string,
  "createdAt": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | machineId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_iaas_network_list`

```
Tool Name: vcf_iaas_network_list
Description: 프로비저닝된 네트워크 목록을 조회한다. 서브넷, CIDR, 가용 IP 정보를 포함한다.
API Mapping: GET /iaas/api/networks
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": [],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "특정 프로젝트의 네트워크만 조회"
    },
    "$top":     { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip":    { "$ref": "#/components/PaginationParams/properties/$skip" },
    "$filter":  { "$ref": "#/components/PaginationParams/properties/$filter" },
    "$orderby": { "$ref": "#/components/PaginationParams/properties/$orderby" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string,
      "name": string,
      "cidr": string,
      "subnetType": string,
      "deploymentId": string,
      "projectId": string,
      "tags": [{ "key": string, "value": string }],
      "cloudAccountIds": string[]
    }
  ],
  "totalElements": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_iaas_network_get`

```
Tool Name: vcf_iaas_network_get
Description: 특정 네트워크의 CIDR, 게이트웨이, DNS, 태그 상세 정보를 조회한다.
API Mapping: GET /iaas/api/networks/{networkId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["networkId"],
  "properties": {
    "networkId": {
      "$ref": "#/components/UUIDParam",
      "description": "조회할 네트워크 UUID"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "cidr": string,
  "gateway": string,
  "domain": string,
  "dnsServerAddresses": string[],
  "dnsSearchDomains": string[],
  "subnetType": "PUBLIC" | "PRIVATE" | "OUTBOUND",
  "deploymentId": string,
  "projectId": string,
  "cloudAccountIds": string[],
  "tags": [{ "key": string, "value": string }]
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | networkId 없음 |
| 500 | 서버 내부 오류 |

---

## 7. ABX / Extensibility

### `vcf_abx_action_list`

```
Tool Name: vcf_abx_action_list
Description: 등록된 ABX(Action-Based eXtensibility) 액션 목록을 조회한다.
             런타임, 프로젝트, 이름으로 필터링 가능하다.
API Mapping: GET /abx/api/resources/actions
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": [],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "특정 프로젝트의 ABX 액션만 조회"
    },
    "runtime": {
      "type": "string",
      "enum": ["python", "nodejs", "powershell", "bash"],
      "description": "런타임 환경으로 필터링"
    },
    "$top":     { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip":    { "$ref": "#/components/PaginationParams/properties/$skip" },
    "$filter":  { "$ref": "#/components/PaginationParams/properties/$filter" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string,
      "name": string,
      "description": string,
      "runtime": string,
      "memoryInMB": number,
      "timeoutSeconds": number,
      "projectId": string,
      "createdAt": string,
      "updatedAt": string
    }
  ],
  "totalElements": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_abx_action_get`

```
Tool Name: vcf_abx_action_get
Description: 특정 ABX 액션의 소스코드, 환경 변수(비밀값 제외), 의존성 목록을 조회한다.
API Mapping: GET /abx/api/resources/actions/{actionId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["actionId"],
  "properties": {
    "actionId": {
      "$ref": "#/components/UUIDParam",
      "description": "조회할 ABX 액션 UUID"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "description": string,
  "runtime": string,
  "handler": string,        // 진입점 함수명 (예: "handler.main")
  "source": string,         // 소스코드 (인라인 타입인 경우)
  "dependencies": string,   // requirements.txt / package.json 내용
  "inputs": object,         // 입력 파라미터 JSON Schema
  "memoryInMB": number,
  "timeoutSeconds": number,
  "shared": boolean,
  "projectId": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | actionId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_abx_action_run`

```
Tool Name: vcf_abx_action_run
Description: ABX 액션을 즉시 실행한다. 비동기 작업이며 runId를 반환한다.
             실행 결과는 vcf_abx_action_get_run으로 폴링한다.
API Mapping: POST /abx/api/resources/actions/{actionId}/runs
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["actionId"],
  "properties": {
    "actionId": {
      "$ref": "#/components/UUIDParam",
      "description": "실행할 ABX 액션 UUID"
    },
    "inputs": {
      "type": "object",
      "description": "액션 입력 파라미터 키-값 맵",
      "additionalProperties": true
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "runId": string (UUID),
  "actionId": string,
  "status": "RUNNING",
  "startedAt": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 inputs 파라미터 |
| 401 | 인증 오류 |
| 403 | 실행 권한 없음 |
| 404 | actionId 없음 |
| 409 | 동일 액션 동시 실행 제한 초과 |
| 500 | 서버 내부 오류 |

---

### `vcf_abx_action_get_run`

```
Tool Name: vcf_abx_action_get_run
Description: ABX 액션 실행 결과와 로그를 조회한다. vcf_abx_action_run 호출 후 폴링에 사용한다.
API Mapping: GET /abx/api/resources/actions/{actionId}/runs/{runId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["actionId", "runId"],
  "properties": {
    "actionId": {
      "$ref": "#/components/UUIDParam",
      "description": "실행한 ABX 액션 UUID"
    },
    "runId": {
      "$ref": "#/components/UUIDParam",
      "description": "조회할 실행 UUID (vcf_abx_action_run 반환값)"
    },
    "includeLogs": {
      "type": "boolean",
      "description": "true이면 실행 로그 포함 반환",
      "default": true
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "actionId": string,
  "status": "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED",
  "outputs": object,      // 액션이 반환한 결과값
  "error": string,        // 실패 시 오류 메시지
  "log": string,          // includeLogs=true 시 포함
  "startedAt": string,
  "endedAt": string,
  "durationMs": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 404 | actionId 또는 runId 없음 |
| 500 | 서버 내부 오류 |

---

## 8. Orchestrator — vRO (vRealize Orchestrator)

### `vcf_vro_workflow_list`

```
Tool Name: vcf_vro_workflow_list
Description: vRO에 등록된 워크플로우 목록을 조회한다. 카테고리 경로, 이름으로 검색 가능하다.
API Mapping: GET /vco/api/workflows
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": [],
  "properties": {
    "search": {
      "type": "string",
      "description": "워크플로우 이름 전문 검색",
      "maxLength": 256
    },
    "categoryPath": {
      "type": "string",
      "description": "카테고리 경로로 필터링 (예: 'Library/vSphere/Virtual Machine')",
      "maxLength": 512
    },
    "maxResults": {
      "type": "integer",
      "description": "반환할 최대 워크플로우 수",
      "minimum": 1,
      "maximum": 1000,
      "default": 50
    },
    "startIndex": {
      "type": "integer",
      "description": "페이지네이션 시작 인덱스",
      "minimum": 0,
      "default": 0
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "relations": {
    "link": [
      {
        "attributes": [
          { "name": "id", "value": string },
          { "name": "name", "value": string },
          { "name": "description", "value": string },
          { "name": "version", "value": string },
          { "name": "href", "value": string }
        ]
      }
    ]
  },
  "total": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 워크플로우 조회 권한 없음 |
| 500 | vRO 서버 오류 |

---

### `vcf_vro_workflow_get`

```
Tool Name: vcf_vro_workflow_get
Description: 특정 vRO 워크플로우의 상세 정보, 입력/출력 파라미터 스키마를 조회한다.
             실행 전 필수 파라미터 구조를 확인하는 용도로 사용한다.
API Mapping: GET /vco/api/workflows/{workflowId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["workflowId"],
  "properties": {
    "workflowId": {
      "type": "string",
      "description": "조회할 vRO 워크플로우 ID (UUID 형식 또는 vRO 내부 ID)",
      "minLength": 1,
      "maxLength": 256
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "name": string,
  "description": string,
  "version": string,
  "input-parameters": [
    {
      "name": string,
      "type": string,         // vRO 타입 (string, number, boolean, VC:VirtualMachine 등)
      "description": string,
      "required": boolean
    }
  ],
  "output-parameters": [
    { "name": string, "type": string, "description": string }
  ]
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | workflowId 없음 |
| 500 | vRO 서버 오류 |

---

### `vcf_vro_workflow_execute`

```
Tool Name: vcf_vro_workflow_execute
Description: vRO 워크플로우를 실행한다. 비동기 작업이며 executionId를 반환한다.
             완료 상태는 vcf_vro_execution_get으로 폴링한다.
API Mapping: POST /vco/api/workflows/{workflowId}/executions
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["workflowId"],
  "properties": {
    "workflowId": {
      "type": "string",
      "description": "실행할 vRO 워크플로우 ID",
      "minLength": 1,
      "maxLength": 256
    },
    "parameters": {
      "type": "array",
      "description": "워크플로우 입력 파라미터 배열. vRO 파라미터 형식 준수 필요",
      "items": {
        "type": "object",
        "required": ["name", "type", "value"],
        "properties": {
          "name": {
            "type": "string",
            "description": "파라미터 이름"
          },
          "type": {
            "type": "string",
            "description": "vRO 데이터 타입 (string, number, boolean, Array/string 등)"
          },
          "value": {
            "description": "파라미터 값. type에 따라 구조가 달라짐"
          },
          "scope": {
            "type": "string",
            "description": "파라미터 범위. 기본값 'local'",
            "default": "local"
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "executionId": string,
  "workflowId": string,
  "state": "running",
  "href": string           // 상태 폴링 URL
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 파라미터 타입 또는 누락 |
| 401 | 인증 오류 |
| 403 | 워크플로우 실행 권한 없음 |
| 404 | workflowId 없음 |
| 409 | 동시 실행 제한 초과 |
| 500 | vRO 서버 오류 |

---

### `vcf_vro_execution_get`

```
Tool Name: vcf_vro_execution_get
Description: vRO 워크플로우 실행 상태, 로그, 출력 파라미터를 조회한다.
             vcf_vro_workflow_execute 호출 후 완료 폴링에 사용한다.
API Mapping: GET /vco/api/workflows/{workflowId}/executions/{executionId}
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["workflowId", "executionId"],
  "properties": {
    "workflowId": {
      "type": "string",
      "description": "워크플로우 ID",
      "minLength": 1,
      "maxLength": 256
    },
    "executionId": {
      "type": "string",
      "description": "조회할 실행 ID (vcf_vro_workflow_execute 반환값)",
      "minLength": 1,
      "maxLength": 256
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "workflowId": string,
  "state": "running" | "completed" | "failed" | "canceled",
  "startDate": string,
  "endDate": string,
  "output-parameters": [
    { "name": string, "type": string, "value": object }
  ],
  "current-step": string,
  "content-exception": string    // 실패 시 예외 내용
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 404 | workflowId 또는 executionId 없음 |
| 500 | vRO 서버 오류 |

---

### `vcf_vro_execution_list`

```
Tool Name: vcf_vro_execution_list
Description: 특정 vRO 워크플로우의 실행 이력을 조회한다. 상태별 필터링과 날짜 범위 검색을 지원한다.
API Mapping: GET /vco/api/workflows/{workflowId}/executions
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["workflowId"],
  "properties": {
    "workflowId": {
      "type": "string",
      "description": "실행 이력을 조회할 워크플로우 ID",
      "minLength": 1,
      "maxLength": 256
    },
    "status": {
      "type": "string",
      "enum": ["running", "completed", "failed", "canceled"],
      "description": "실행 상태로 필터링"
    },
    "maxResults": {
      "type": "integer",
      "description": "반환할 최대 실행 수",
      "minimum": 1,
      "maximum": 500,
      "default": 20
    },
    "startIndex": {
      "type": "integer",
      "description": "페이지네이션 시작 인덱스",
      "minimum": 0,
      "default": 0
    },
    "startedAfter": {
      "type": "string",
      "format": "date-time",
      "description": "이 시각 이후에 시작된 실행만 조회 (ISO 8601)"
    },
    "startedBefore": {
      "type": "string",
      "format": "date-time",
      "description": "이 시각 이전에 시작된 실행만 조회 (ISO 8601)"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "relations": {
    "link": [
      {
        "attributes": [
          { "name": "id", "value": string },
          { "name": "state", "value": string },
          { "name": "startDate", "value": string },
          { "name": "endDate", "value": string }
        ]
      }
    ]
  },
  "total": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | workflowId 없음 |
| 500 | vRO 서버 오류 |

---

## 9. Governance / Quotas (거버넌스 및 쿼터)

### `vcf_governance_get_quota`

```
Tool Name: vcf_governance_get_quota
Description: 특정 프로젝트의 리소스 쿼터 설정과 현재 사용량을 조회한다.
             클라우드 존별 CPU, 메모리, 스토리지, 인스턴스 수 제한을 확인한다.
API Mapping: GET /iaas/api/projects/{projectId}  (zoneAssignmentConfigurations 필드 활용)
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["projectId"],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "쿼터를 조회할 프로젝트 UUID"
    },
    "includeUsage": {
      "type": "boolean",
      "description": "true이면 현재 사용량 수치 포함 반환",
      "default": true
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "projectId": string,
  "projectName": string,
  "quotas": [
    {
      "zoneId": string,
      "zoneName": string,
      "limits": {
        "cpuLimit": number,          // vCPU 개수 (0 = 무제한)
        "memoryLimitMB": number,     // MB 단위
        "storageLimitGB": number,    // GB 단위
        "maxNumberInstances": number
      },
      "usage": {                     // includeUsage=true 시 포함
        "cpuUsed": number,
        "memoryUsedMB": number,
        "storageUsedGB": number,
        "instanceCount": number
      },
      "utilizationPercent": {
        "cpu": number,
        "memory": number,
        "storage": number,
        "instances": number
      }
    }
  ]
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | projectId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_governance_update_quota`

```
Tool Name: vcf_governance_update_quota
Description: 프로젝트의 클라우드 존별 리소스 쿼터를 수정한다.
             쿼터를 현재 사용량보다 낮게 설정하면 신규 배포만 제한되며 기존 배포는 유지된다.
API Mapping: PATCH /iaas/api/projects/{projectId}
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["projectId", "zoneAssignmentConfigurations"],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "쿼터를 수정할 프로젝트 UUID"
    },
    "zoneAssignmentConfigurations": {
      "type": "array",
      "description": "클라우드 존별 쿼터 설정 목록. 전체 존 설정이 교체됨",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["zoneId"],
        "properties": {
          "zoneId": {
            "$ref": "#/components/UUIDParam",
            "description": "쿼터를 설정할 클라우드 존 UUID"
          },
          "priority": {
            "type": "integer",
            "description": "배포 우선순위 (낮을수록 우선 사용). 기본값 1",
            "minimum": 1,
            "maximum": 100,
            "default": 1
          },
          "cpuLimit": {
            "type": "integer",
            "description": "vCPU 개수 제한 (0 = 무제한)",
            "minimum": 0
          },
          "memoryLimitMB": {
            "type": "integer",
            "description": "메모리 제한 (MB). 0 = 무제한",
            "minimum": 0
          },
          "storageLimitGB": {
            "type": "integer",
            "description": "스토리지 제한 (GB). 0 = 무제한",
            "minimum": 0
          },
          "maxNumberInstances": {
            "type": "integer",
            "description": "최대 VM 인스턴스 수. 0 = 무제한",
            "minimum": 0
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "projectId": string,
  "updatedZones": [
    {
      "zoneId": string,
      "zoneName": string,
      "cpuLimit": number,
      "memoryLimitMB": number,
      "storageLimitGB": number,
      "maxNumberInstances": number
    }
  ],
  "updatedAt": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 zoneId 또는 음수 쿼터 값 |
| 401 | 인증 오류 |
| 403 | 쿼터 수정 권한 없음 (Project Admin 이상 필요) |
| 404 | projectId 없음 |
| 422 | 지정한 zoneId가 프로젝트에 할당되지 않음 |
| 500 | 서버 내부 오류 |

---

## 10. Approval Policies (승인 정책)

### `vcf_approval_list_policies`

```
Tool Name: vcf_approval_list_policies
Description: 조직 또는 프로젝트에 적용된 승인 정책 목록을 조회한다.
             카탈로그 아이템과 연결된 승인 정책 구성을 확인할 때 사용한다.
API Mapping: GET /catalog/api/approval-policies
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": [],
  "properties": {
    "projectId": {
      "$ref": "#/components/UUIDParam",
      "description": "특정 프로젝트에 적용된 승인 정책만 조회"
    },
    "status": {
      "type": "string",
      "enum": ["ACTIVE", "INACTIVE", "DRAFT"],
      "description": "정책 상태로 필터링"
    },
    "$top":     { "$ref": "#/components/PaginationParams/properties/$top" },
    "$skip":    { "$ref": "#/components/PaginationParams/properties/$skip" }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "content": [
    {
      "id": string,
      "name": string,
      "description": string,
      "status": "ACTIVE" | "INACTIVE" | "DRAFT",
      "enforcementType": "HARD" | "SOFT",
      "approvers": [
        { "type": "user" | "group", "value": string }
      ],
      "autoApprovalExpiry": number,    // 자동 승인 만료 시간 (시간)
      "scope": {
        "projectIds": string[],
        "catalogItemIds": string[]
      },
      "createdAt": string,
      "updatedAt": string
    }
  ],
  "totalElements": number
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 정책 조회 권한 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_approval_get_request`

```
Tool Name: vcf_approval_get_request
Description: 승인 대기 중인 특정 요청의 상세 정보와 승인 이력을 조회한다.
             승인자가 승인/거부 전 내용을 검토할 때 사용한다.
API Mapping: GET /catalog/api/requests/{requestId}  (approvalStatus 상세 포함)
Security Classification: READ
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["requestId"],
  "properties": {
    "requestId": {
      "$ref": "#/components/UUIDParam",
      "description": "조회할 카탈로그 요청 UUID"
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "id": string,
  "deploymentName": string,
  "catalogItemName": string,
  "status": "PENDING_APPROVAL",
  "requestedBy": string,
  "requestedAt": string,
  "reason": string,
  "inputs": object,
  "approvalDetails": {
    "policyId": string,
    "policyName": string,
    "enforcementType": string,
    "requiredApprovers": [{ "type": string, "value": string }],
    "approvalActions": [
      {
        "action": "APPROVE" | "REJECT",
        "performedBy": string,
        "performedAt": string,
        "comment": string
      }
    ],
    "expiresAt": string
  }
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 401 | 인증 오류 |
| 403 | 접근 권한 없음 |
| 404 | requestId 없음 |
| 500 | 서버 내부 오류 |

---

### `vcf_approval_decide`

```
Tool Name: vcf_approval_decide
Description: 대기 중인 카탈로그 요청을 승인하거나 거부한다.
             HARD 승인 정책의 경우 거부 시 배포가 완전히 취소된다.
             이 작업은 즉시 반영되며 요청자에게 알림이 전송된다.
API Mapping: POST /catalog/api/requests/{requestId}/approve  또는  /reject
Security Classification: WRITE
```

**Input Schema:**
```json
{
  "type": "object",
  "required": ["requestId", "decision"],
  "properties": {
    "requestId": {
      "$ref": "#/components/UUIDParam",
      "description": "승인/거부할 카탈로그 요청 UUID"
    },
    "decision": {
      "type": "string",
      "enum": ["APPROVE", "REJECT"],
      "description": "APPROVE: 요청 승인 및 배포 진행, REJECT: 요청 거부 및 배포 취소"
    },
    "comment": {
      "type": "string",
      "description": "승인/거부 사유 또는 코멘트. 거부 시 필수 권장",
      "maxLength": 1024
    }
  },
  "additionalProperties": false
}
```

**Output:**
```
{
  "requestId": string,
  "decision": "APPROVE" | "REJECT",
  "processedBy": string,
  "processedAt": string,
  "comment": string,
  "resultStatus": "IN_PROGRESS" | "CANCELLED",  // APPROVE → IN_PROGRESS, REJECT → CANCELLED
  "deploymentId": string
}
```

**Error Handling:**
| 코드 | 의미 |
|------|------|
| 400 | 잘못된 decision 값 |
| 401 | 인증 오류 |
| 403 | 승인 권한 없음 (해당 정책의 승인자가 아님) |
| 404 | requestId 없음 |
| 409 | 이미 처리된 요청 (승인/거부/만료) |
| 500 | 서버 내부 오류 |

---

## 보안 정책 부록

### 전체 Tool 보안 등급 분류표

| Security Tier | Tool 수 | Tool 목록 |
|---------------|---------|-----------|
| **READ** | 27 | vcf_auth_get_token, vcf_deployment_list/get/get_status, vcf_catalog_list_items/get_item/list_requests/get_request, vcf_resource_list/get/list_actions, vcf_project_list/get, vcf_blueprint_list/get/validate/list_versions, vcf_iaas_machine_list/get, vcf_iaas_network_list/get, vcf_abx_action_list/get/get_run, vcf_vro_workflow_list/get/execution_get/execution_list, vcf_governance_get_quota, vcf_approval_list_policies/get_request |
| **WRITE** | 15 | vcf_deployment_create/update/run_action, vcf_catalog_request, vcf_resource_run_action, vcf_project_create/update, vcf_blueprint_create/update, vcf_abx_action_run, vcf_vro_workflow_execute, vcf_governance_update_quota, vcf_approval_decide |
| **DESTRUCTIVE** | 5 | vcf_deployment_delete, vcf_project_delete, vcf_blueprint_delete, vcf_resource_run_action (PowerOff/Delete 액션 시) |

### 보안 제어 적용 기준

```
Tier 1 (READ):
  - LLM 자율 실행 허용
  - 로그 기록 권장 (필수 아님)

Tier 2 (WRITE):
  - LLM은 반드시 실행 전 "다음과 같이 실행하겠습니다 — 계속하시겠습니까?" 확인 요청
  - 모든 실행: timestamp + 사용자 신원 + 파라미터 감사 로그 기록
  - 분당 최대 10회 WRITE 제한 (per user session)

Tier 3 (DESTRUCTIVE):
  - 리소스 이름을 사용자가 직접 타이핑하는 확인 단계 필수
  - 실행 전 영향 분석 보고서 표시 (affectedResources 포함)
  - dryRun=true 기본값 — false는 명시적 지정 필요
  - VCF 승인 정책 존재 여부 사전 확인 필수

Tier 4 (CATASTROPHIC — MCP 레벨에서 차단):
  - 조직 전체 배포 일괄 삭제
  - 전체 프로젝트 삭제
  - 클라우드 계정 제거
  → MCP 서버가 API 호출 자체를 거부, 사용자에게 콘솔 직접 작업 안내
```

---

## 구현 로드맵

### Phase 1 — MVP (1~2개월)
READ 전용 도구 27개 + 핵심 WRITE 3개 (`vcf_auth_get_token`, `vcf_deployment_create`, `vcf_catalog_request`)를 구현합니다. 이 단계에서 LLM은 인프라 현황 조회, 카탈로그 기반 셀프서비스 배포를 자연어로 처리할 수 있게 됩니다.

### Phase 2 — Enhanced (2~3개월)
나머지 WRITE 도구 12개와 Day-2 액션 체계를 완성합니다. 비동기 폴링 패턴을 표준화하고, ABX 및 vRO 연동으로 커스텀 확장성을 확보합니다. 거버넌스 및 승인 정책 도구로 컴플라이언스 자동화를 구현합니다.

### Phase 3 — Full Automation (3~6개월)
DESTRUCTIVE 도구 5개를 엄격한 보안 제어와 함께 활성화합니다. 멀티-Tool 체인 시나리오(예: "개발 환경 전체를 현재 상태 그대로 스테이징에 복제해줘")를 최적화하고, 비용 드리프트 감지 및 자동 권고 워크플로우를 구축합니다.