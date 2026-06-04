import { query } from '@/lib/db';
import ExecutionLog from '@/components/ExecutionLog';

export const metadata = { title: 'Executions — TaskScheduler' };

export default async function ExecutionsPage() {
  const tasks = await query('SELECT id, name FROM tasks ORDER BY name ASC');

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>Executions</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Full history of every LLM task run</p>
      </div>
      <ExecutionLog tasks={tasks} />
    </div>
  );
}
