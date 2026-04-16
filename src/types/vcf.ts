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

// ─── Orchestrator (vRO) ──────────────────────────────────────────────────────

export interface VcfVroWorkflow {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly version: string;
  readonly categoryName: string;
  readonly inputParameters: readonly VcfVroParameter[];
  readonly outputParameters: readonly VcfVroParameter[];
}

export interface VcfVroParameter {
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly required: boolean;
}

export interface VcfVroExecution {
  readonly id: string;
  readonly workflowId: string;
  readonly state: 'running' | 'completed' | 'failed' | 'canceled' | 'waiting';
  readonly startDate: string;
  readonly endDate?: string;
  readonly startedBy: string;
  readonly error?: string;
  readonly outputParameters?: readonly {
    readonly name: string;
    readonly type: string;
    readonly value: unknown;
  }[];
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
