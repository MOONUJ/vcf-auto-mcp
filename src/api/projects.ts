/**
 * src/api/projects.ts — VCF Automation Projects API calls
 */

import { vcfGet, vcfPost, vcfPatch, vcfDelete } from './client.js';
import type { VcfPage, VcfProject } from '../types/vcf.js';
import type {
  ProjectListInput,
  ProjectGetInput,
  ProjectCreateInput,
  ProjectUpdateInput,
  ProjectDeleteInput,
} from '../schemas/projects.js';

export async function apiListProjects(input: ProjectListInput): Promise<VcfPage<VcfProject>> {
  return vcfGet('/project-service/api/projects', input);
}

export async function apiGetProject(input: ProjectGetInput): Promise<VcfProject> {
  return vcfGet(`/project-service/api/projects/${input.projectId}`);
}

export async function apiCreateProject(input: ProjectCreateInput): Promise<VcfProject> {
  return vcfPost('/project-service/api/projects', input);
}

export async function apiUpdateProject(input: ProjectUpdateInput): Promise<VcfProject> {
  const { projectId, ...body } = input;
  return vcfPatch(`/project-service/api/projects/${projectId}`, body);
}

export async function apiDeleteProject(input: ProjectDeleteInput): Promise<void> {
  await vcfDelete(`/project-service/api/projects/${input.projectId}`);
}
