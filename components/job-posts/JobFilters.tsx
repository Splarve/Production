'use client';

// components/job-posts/JobFilters.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CheckCircle2, Filter, X } from 'lucide-react';

// Job types for dropdown
const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' }
];

interface Filters {
  search: string;
  status: 'all' | 'published' | 'draft';
  jobType: string;
}

interface JobFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
}

export function JobFilters({ 
  onFilterChange,
  initialFilters = {}
}: JobFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    jobType: '',
    ...initialFilters
  });
  
  const [activeFilterCount, setActiveFilterCount] = useState<number>(
    Object.values(initialFilters).filter(value => value !== '' && value !== 'all').length
  );
  
  const updateFilters = (newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Count active filters (excluding search)
    const count = Object.entries(updatedFilters)
      .filter(([key, value]) => 
        key !== 'search' && value !== '' && value !== 'all'
      )
      .length;
    
    setActiveFilterCount(count);
    
    // Call the callback with updated filters
    onFilterChange(updatedFilters);
  };
  
  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      status: 'all',
      jobType: ''
    };
    
    setFilters(defaultFilters);
    setActiveFilterCount(0);
    onFilterChange(defaultFilters);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Input
              placeholder="Search job posts..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pr-10 border-[#c9a0ff]/50 focus:border-[#8f00ff] focus:ring-[#8f00ff]/20"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => updateFilters({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
        </form>
        
        {/* Filters dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-[#c9a0ff]/50 text-[#4b0076] hover:bg-[#c9a0ff]/10 hover:text-[#8f00ff]">
              <Filter size={16} className="mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#8f00ff] text-[10px] font-medium text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter Jobs</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <div className="p-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilters({ status: value as 'all' | 'published' | 'draft' })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium">Job Type</label>
                <Select
                  value={filters.jobType}
                  onValueChange={(value) => updateFilters({ jobType: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={resetFilters}
                disabled={activeFilterCount === 0}
              >
                <X size={16} className="mr-2" />
                Reset filters
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <div className="flex items-center gap-1 bg-[#c9a0ff]/10 text-[#8f00ff] rounded-full px-3 py-1 text-sm">
              <CheckCircle2 size={14} />
              <span className="capitalize">{filters.status}</span>
              <button
                onClick={() => updateFilters({ status: 'all' })}
                className="ml-1 text-[#8f00ff] hover:text-[#4b0076]"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {filters.jobType && (
            <div className="flex items-center gap-1 bg-[#c9a0ff]/10 text-[#8f00ff] rounded-full px-3 py-1 text-sm">
              <CheckCircle2 size={14} />
              <span>
                {JOB_TYPES.find(t => t.value === filters.jobType)?.label || filters.jobType}
              </span>
              <button
                onClick={() => updateFilters({ jobType: '' })}
                className="ml-1 text-[#8f00ff] hover:text-[#4b0076]"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          <button
            onClick={resetFilters}
            className="text-sm text-muted-foreground hover:text-[#8f00ff]"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}