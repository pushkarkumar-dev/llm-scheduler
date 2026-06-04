import { query } from '@/lib/db';
import ExecutionLog from '@/components/ExecutionLog';

export const metadata = { title: 'Executions — LLM Scheduler' };

export default async function ExecutionsPage() {
  const tasks = await query('SELECT id, name FROM tasks ORDER BY name ASC');

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Executions</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Full history of every LLM task run</p>
      </div>
      <ExecutionLog tasks={tasks} />
    </div>
  );
}
