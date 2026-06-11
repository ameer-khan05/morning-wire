import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { repoFile } from './helpers.js';

const workflowYaml = repoFile('.github/workflows/daily-build.yml');
const workflow = yaml.load(workflowYaml);

describe('daily-build.yml — workflow structure', () => {
  it('has a name', () => {
    expect(workflow.name).toBeTruthy();
  });

  it('triggers on schedule and workflow_dispatch', () => {
    expect(workflow.on).toBeTruthy();
    expect(workflow.on.schedule).toBeTruthy();
    expect(workflow.on.workflow_dispatch).toBeDefined();
  });

  it('schedule uses a valid cron expression', () => {
    const crons = workflow.on.schedule;
    expect(Array.isArray(crons)).toBe(true);
    expect(crons.length).toBeGreaterThanOrEqual(1);
    const parts = crons[0].cron.split(' ');
    expect(parts.length).toBe(5);
  });

  it('requests contents:write permission', () => {
    expect(workflow.permissions?.contents).toBe('write');
  });

  it('requests issues:write permission for failure alerts', () => {
    expect(workflow.permissions?.issues).toBe('write');
  });

  it('uses concurrency to avoid parallel builds', () => {
    expect(workflow.concurrency).toBeTruthy();
    expect(workflow.concurrency.group).toBeTruthy();
  });
});

describe('daily-build.yml — build job', () => {
  const job = workflow.jobs?.build;

  it('build job exists', () => {
    expect(job).toBeTruthy();
  });

  it('runs on ubuntu-latest', () => {
    expect(job['runs-on']).toBe('ubuntu-latest');
  });

  it('has a timeout', () => {
    expect(job['timeout-minutes']).toBeGreaterThan(0);
  });

  it('has a checkout step', () => {
    const checkoutStep = job.steps.find(
      (s) => s.uses && s.uses.startsWith('actions/checkout')
    );
    expect(checkoutStep).toBeTruthy();
  });

  it('has a Node setup step', () => {
    const nodeStep = job.steps.find(
      (s) => s.uses && s.uses.startsWith('actions/setup-node')
    );
    expect(nodeStep).toBeTruthy();
  });

  it('installs Claude Code CLI', () => {
    const cliStep = job.steps.find(
      (s) => s.name && s.name.toLowerCase().includes('claude code')
    );
    expect(cliStep).toBeTruthy();
    expect(cliStep.run).toContain('npm install -g @anthropic-ai/claude-code');
  });

  it('generate step uses CLAUDE_CODE_OAUTH_TOKEN secret', () => {
    const genStep = job.steps.find(
      (s) => s.name && s.name.toLowerCase().includes('generate')
    );
    expect(genStep).toBeTruthy();
    expect(genStep.env?.CLAUDE_CODE_OAUTH_TOKEN).toContain(
      'secrets.CLAUDE_CODE_OAUTH_TOKEN'
    );
  });

  it('generate step has a timeout', () => {
    const genStep = job.steps.find(
      (s) => s.name && s.name.toLowerCase().includes('generate')
    );
    expect(genStep.run).toContain('timeout');
  });

  it('has a commit-and-push step', () => {
    const commitStep = job.steps.find(
      (s) => s.run && s.run.includes('git push origin main')
    );
    expect(commitStep).toBeTruthy();
  });

  it('has a failure-alert step that opens a GitHub issue', () => {
    const alertStep = job.steps.find(
      (s) => s.run && s.run.includes('gh issue')
    );
    expect(alertStep).toBeTruthy();
    expect(alertStep.if).toMatch(/failure|cancelled/);
  });
});
