import type { Row } from './rows';

type Props = { caption: string; label: string; value: string; rows: Row[] };

export function ChartTable({ caption, label, value, rows }: Props) {
  return (
    // A caption is its own box outside the table in Firefox, so the wrapper does the hiding.
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{label}</th>
            <th scope="col">{value}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
