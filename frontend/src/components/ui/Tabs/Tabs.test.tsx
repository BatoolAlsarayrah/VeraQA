import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { TabPanel } from './TabPanel';
import { Tabs } from './Tabs';

type Id = 'pending' | 'approved' | 'all';

function Example() {
  const [value, setValue] = useState<Id>('pending');
  return (
    <>
      <Tabs
        name="requirements"
        label="Requirements"
        value={value}
        onChange={setValue}
        tabs={[
          { id: 'pending', label: 'Pending review', count: 5 },
          { id: 'approved', label: 'Approved', count: 21 },
          { id: 'all', label: 'All', count: 26 },
        ]}
      />
      <TabPanel name="requirements" id={value}>
        Showing {value}
      </TabPanel>
    </>
  );
}

describe('Tabs', () => {
  it('marks the current tab and ties it to its panel', () => {
    render(<Example />);
    const tab = screen.getByRole('tab', { name: 'Pending review 5' });

    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Pending review 5' })).toHaveTextContent(
      'Showing pending',
    );
  });

  it('has one tab stop and moves with the arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.tab();
    expect(screen.getByRole('tab', { name: 'Pending review 5' })).toHaveFocus();
    expect(screen.getAllByRole('tab').filter((tab) => tab.tabIndex === 0)).toHaveLength(1);

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Approved 21' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Approved 21' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'All 26' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Pending review 5' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'All 26' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Pending review 5' })).toHaveFocus();
  });

  it('switches on click', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole('tab', { name: 'All 26' }));

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Showing all');
  });
});
