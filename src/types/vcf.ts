/**
 * src/types/vcf.ts — VCF Automation REST API response TypeScript interfaces
 *
 * All interfaces are readonly to prevent accidental mutation in handlers.
 * Optional fields use `| undefined` rather than `?` where strictness matters.
 */

// ─── Common ───────────────────────────────────────────────────────────────────

export interface VcfPage<T> {
  readonly content: readonly T[];
  readonly totalElements: number;
  readonly totalPages: number;
  readonly pageable: {
    readonly pageNumber: number;
    readonly pageSize: number;
  };
}

export type AsyncStatus =
  | 'PENDING'
  | 'INPROGRESS'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'CANCELLED';

export type DeploymentStatus =
  | 'CREATE_SUCCESSFUL'
  | 'CREATE_INPROGRESS'
  | 'CREATE_FAILED'
  | 'UPDATE_SUCCESSFUL'
  | 'UPDATE_INPROGRESS'
  | 'UPDATE_FAILED'
  | 'DELETE_INPROGRESS'
  | 'DELETE_FAILED'
  | 'ACTION_INPROGRESS'
  | 'ACTION_SUCCESSFUL'
  | 'ACTION_FAILED';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface VcfTokenResponse {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_in: number;
}

// ─── Deployments ──────────────────────────────────────────────────────────────

export interface VcfDeploymentSummary {
  readonly id: string;
  readonly name: string;
  readonly status: DeploymentStatus;
  readonly projectId: string;
  readonly projectName: string;
  readonly blueprintId: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastUpdatedAt: string;
}

export interface VcfDeploymentDetail extends VcfDeploymentSummary {
  readonly description?: string;
  readonly blueprintVersion?: string;
  readonly inputs: Record<string, unknown>;
  readonly resources?: readonly VcfResource[];
  readonly expense?: {
    readonly totalExpense: number;
    readonly unit: string;
  };
  readonly lastAction?: {
    readonly actionId: string;
    readonly name: string;
    readonly status: AsyncStatus;
    readonly startedAt: string;
    readonly finishedAt?: string;
    readonly failureMessage?: string;
  };
}

export interface VcfDeploymentRequest {
  readonly id: string;
  readonly deploymentId: string;
  readonly requestType: 'CREATE' | 'UPDATE' | 'DELETE' | 'DAY2_ACTION';
  readonly status: AsyncStatus;
  readonly progress: number;
  readonly startedAt: string;
  readonly finishedAt?: string;
  readonly failureMessage?: string;
  readonly resourceChanges?: readonly {
    readonly resourceId: string;
    readonly resourceName: string;
    readonly changeType: string;
  }[];
}

export interface VcfAsyncResponse {
  readonly requestId: string;
  readonly status: string;
}

export interface VcfDeploymentCreateResponse extends VcfAsyncResponse {
  readonly deploymentId: string;
  readonly requestTrackerUrl: string;
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export interface VcfCatalogItem {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: {
    readonly id: string;
    readonly name: string;
  };
  readonly sourceId: string;
  readonly sourceName: string;
  readonly projectIds: readonly string[];
  readonly createdAt: string;
  readonly lastUpdatedAt: string;
}

export interface VcfCatalogRequest {
  readonly id: string;
  readonly deploymentId?: string;
  readonly deploymentName: string;
  readonly catalogItemId: string;
  readonly catalogItemVersion?: string;
  readonly status: AsyncStatus;
  readonly inputs: Record<string, unknown>;
  readonly createdAt: string;
  readonly lastUpdatedAt: string;
  readonly failureMessage?: string;
}

// ─── Resources ────────────────────────────────────────────────────────────────

export interface VcfResource {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly deploymentId: string;
  readonly status: string;
  readonly properties: Record<string, unknown>;
  readonly createdAt: string;
  readonly lastUpdatedAt: string;
}

export interface VcfResourceAction {
  readonly actionId: string;
  readonly name: string;
  readonly description?: string;
  readonly valid: boolean;
  readonly type: string;
}

// ─── Projects ────────────────────────────────────────────────────────────────

export interface VcfProject {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly orgId: string;
  readonly administrators: readonly VcfProjectMember[];
  readonly members: readonly VcfProjectMember[];
  readonly viewers: readonly VcfProjectMember[];
  readonly createdAt: string;
  readonly lastUpdatedAt: string;
}

export interface VcfProjectMember {
  readonly email: string;
  readonly type: 'user' | 'group';
}

// ─── Blueprints ───────────────────────────────────────────────────────────────

export interface VcfBlueprint {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly content: string; // YAML
  readonly status: 'DRAFT' | 'VERSIONED' | 'RELEASED';
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastUpdatedAt: string;
}

export interface VcfBlueprintVersion {
  readonly id: string;
  readonly blueprintId: string;
  readonly version: string;
  readonly description?: string;
  readonly status: 'DRAFT' | 'VERSIONED' | 'RELEASED';
  readonly createdAt: string;
  readonly createdBy: string;
}

export interface VcfBlueprintValidation {
  readonly valid: boolean;
  readonly messages: readonly {
    readonly type: 'ERROR' | 'WARNING' | 'INFO';
    readonly path: string;
    readonly message: string;
  }[];
}

// ─── Cloud Assembly (IaaS) ────────────────────────────────────────────────────

export interface VcfMachine {
  readonly id: string;
  readonly name: string;
  readonly powerState: 'ON' | 'OFF' | 'SUSPENDED';
  readonly address: string;
  readonly cloudAccountIds: readonly string[];
  readonly projectId: string;
  readonly deploymentId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly customProperties: Record<string, string>;
}

export interface VcfNetwork {
  readonly id: string;
  readonly name: string;
  readonly cidr?: string;
  readonly cloudAccountIds: readonly string[];
  readonly projectId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly customProperties: Record<string, string>;
}

// ─── ABX / Extensibility ──────────────────────────────────────────────────────

export interface VcfAbxAction {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly runtime: string;
  readonly entrypoint: string;
  readonly projectId: string;
  readonly orgId: string;
  readonly createdAt: string;
  readonly lastUpdatedAt: string;
}

export interface VcfAbxRun {
  readonly id: string;
  readonly actionId: string;
  readonly name: string;
  readonly status: AsyncStatus;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly error?: string;
  readonly output?: Record<string, unknown>;
}

// ─── Orchestrator (vRO) — OrchestratorGateway API (/vro/ paths) ──────────────

/**
 * A vRO workflow definition as returned by GET /vro/workflows/{workflowId}.
 * Fields marked optional may only appear when `expand` query param is provided.
 */
export interface VcfVroWorkflow {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly version?: string;
  readonly orgId?: string;
  readonly href?: string;
  /** Present when expand includes "inputParameters" */
  readonly inputParameters?: readonly VcfVroParameter[];
  /** Present when expand includes "outputParameters" */
  readonly outputParameters?: readonly VcfVroParameter[];
  /** Present when expand includes "integration" */
  readonly integration?: {
    readonly endpointConfigurationLink?: string;
  };
}

/** A typed parameter descriptor used in workflow input/output definitions. */
export interface VcfVroParameter {
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly required?: boolean;
}

/**
 * A workflow run as returned by GET /vro/runs or GET /vro/runs/{runId}.
 * Corresponds to the OrchestratorGateway run object shape.
 */
export interface VcfVroRun {
  readonly id: string;
  readonly name?: string;
  readonly runId?: string;
  readonly ownerId?: string | null;
  readonly orgId?: string;
  readonly createdOn?: number;
  readonly modifiedOn?: number;
  readonly configurationId?: string;
  /** Execution state: RUNNING, COMPLETED, FAILED, CANCELED, WAITING */
  readonly state?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly startedBy?: string;
  readonly error?: string;
  readonly outputParameters?: readonly {
    readonly name: string;
    readonly type: string;
    readonly value: unknown;
  }[];
}

/**
 * A single log entry returned by GET /vro/runs/{runId}/logs.
 */
export interface VcfVroRunLog {
  readonly timestamp?: number;
  readonly severity?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
  readonly description?: string;
  readonly origin?: string;
}

/**
 * An aggregated workflow entry as returned by GET /vro/aggregated-workflows.
 * Groups all runs of a given workflow under a single record.
 */
export interface VcfVroAggregatedWorkflow {
  readonly id: string;
  readonly name: string;
  readonly count?: number;
  readonly workflowId?: string;
  readonly selfLink?: string;
}

// ─── Governance ───────────────────────────────────────────────────────────────

export interface VcfQuota {
  readonly projectId: string;
  readonly projectName: string;
  readonly cpuLimit?: number;
  readonly cpuUsed: number;
  readonly memoryLimitMb?: number;
  readonly memoryUsedMb: number;
  readonly storageGbLimit?: number;
  readonly storageGbUsed: number;
  readonly instanceCountLimit?: number;
  readonly instanceCountUsed: number;
  readonly lastUpdatedAt: string;
}

// ─── Custom Resources (form-service) ─────────────────────────────────────────

/**
 * Spring Pageable page wrapper returned by /form-service/api/custom/* list endpoints.
 * Uses `content` array with `totalElements`/`totalPages` similar to VcfPage,
 * but sourced from a different service with slightly different field availability.
 */
export interface VcfCustomResourcePage<T> {
  readonly content: readonly T[];
  readonly totalElements: number;
  readonly totalPages: number;
  readonly number: number;   // current page (zero-based)
  readonly size: number;     // page size
  readonly first: boolean;
  readonly last: boolean;
}

/**
 * A custom resource type definition managed by the form-service.
 */
export interface VcfCustomResourceType {
  readonly id: string;
  readonly displayName: string;
  readonly description?: string;
  readonly resourceType?: string;
  readonly externalType?: string;
  readonly projectId?: string;
  readonly propertiesYaml?: string;
  readonly schemaType?: string;
  readonly createdAt?: string;
  readonly createdBy?: string;
  readonly lastUpdatedAt?: string;
  readonly lastUpdatedBy?: string;
}

/**
 * A resource action associated with a custom resource type.
 * Named VcfResourceActionCustom to avoid collision with the existing VcfResourceAction
 * which is scoped to deployment-level day-2 actions.
 */
export interface VcfResourceActionCustom {
  readonly id: string;
  readonly name: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly resourceType?: string;
  readonly projectId?: string;
  readonly runnableItem?: {
    readonly id: string;
    readonly name: string;
    readonly type: string;   // e.g. 'abx.action' | 'vro.workflow'
  };
  readonly criteria?: Record<string, unknown>;
  readonly createdAt?: string;
  readonly createdBy?: string;
  readonly lastUpdatedAt?: string;
  readonly lastUpdatedBy?: string;
}

// ─── Approval ────────────────────────────────────────────────────────────────

export interface VcfApprovalPolicy {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly policyType: string;
  readonly projectId?: string;
  readonly approvers: readonly string[];
  readonly autoApprovalExpiry?: number;
  readonly enabled: boolean;
  readonly createdAt: string;
  readonly lastUpdatedAt: string;
}

export interface VcfApprovalRequest {
  readonly id: string;
  readonly policyId: string;
  readonly policyName: string;
  readonly requestedBy: string;
  readonly deploymentId?: string;
  readonly deploymentName?: string;
  readonly status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  readonly requestedAt: string;
  readonly decidedAt?: string;
  readonly decidedBy?: string;
  readonly justification?: string;
}
