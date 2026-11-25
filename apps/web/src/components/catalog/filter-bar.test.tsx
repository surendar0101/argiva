import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { FilterBar } from './filter-bar';

describe('FilterBar', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders available filter options', () => {
    const filters = {
      purities: ['92.5', '80'] as const,
      finishes: ['plain', 'oxidised'] as const,
    };
    
    render(
      <FilterBar
        filters={filters}
        activeFilters={{}}
        onFilterChange={vi.fn()}
      />
    );
    
    expect(screen.getByText('Purity')).toBeInTheDocument();
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  test('calls onFilterChange when purity filter is selected', () => {
    const onFilterChange = vi.fn();
    const filters = {
      purities: ['92.5', '80'] as const,
      finishes: ['plain'] as const,
    };
    
    render(
      <FilterBar
        filters={filters}
        activeFilters={{}}
        onFilterChange={onFilterChange}
      />
    );
    
    const purityButton = screen.getByRole('button', { name: /92\.5/i });
    fireEvent.click(purityButton);
    
    expect(onFilterChange).toHaveBeenCalledWith({ purity: '92.5' });
  });

  test('removes a deselected filter instead of storing an undefined value', () => {
    const onFilterChange = vi.fn();

    render(
      <FilterBar
        filters={{ purities: ['92.5'], finishes: [] }}
        activeFilters={{ purity: '92.5' }}
        onFilterChange={onFilterChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '92.5' }));

    expect(onFilterChange.mock.calls[0]?.[0]).toStrictEqual({});
  });

  test('converts an entered minimum rupee price to integer paise', () => {
    const onFilterChange = vi.fn();

    render(
      <FilterBar
        filters={{ purities: [], finishes: [], priceRange: { minPaise: 100000, maxPaise: 250000 } }}
        activeFilters={{}}
        onFilterChange={onFilterChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Minimum price (₹)'), { target: { value: '1200' } });

    expect(onFilterChange).toHaveBeenCalledWith({ minPricePaise: 120000 });
  });

  test('shows active filter state', () => {
    const filters = {
      purities: ['92.5', '80'] as const,
      finishes: ['plain', 'oxidised'] as const,
    };
    
    render(
      <FilterBar
        filters={filters}
        activeFilters={{ purity: '92.5', finish: 'plain' }}
        onFilterChange={vi.fn()}
      />
    );
    
    const activeButtons = screen.getAllByRole('button', { pressed: true });
    expect(activeButtons.length).toBeGreaterThan(0);
  });

  test('renders clear filters button when filters are active', () => {
    const onFilterChange = vi.fn();
    const filters = {
      purities: ['92.5'] as const,
      finishes: ['plain'] as const,
    };
    
    render(
      <FilterBar
        filters={filters}
        activeFilters={{ purity: '92.5' }}
        onFilterChange={onFilterChange}
      />
    );
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    
    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  test('does not render filter groups with no options', () => {
    const filters = {
      purities: [],
      finishes: ['plain'] as const,
    };
    
    render(
      <FilterBar
        filters={filters}
        activeFilters={{}}
        onFilterChange={vi.fn()}
      />
    );
    
    expect(screen.queryByText('Purity')).not.toBeInTheDocument();
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });
});
