
'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, Dot } from 'lucide-react';

export function LeftSidebar() {
  const categories = ['Technology', 'Social', 'Reader', 'Sports', 'Political'];
  const topics = ['Computer', 'Mobile', 'Gaming'];
  
  return (
    <div className="space-y-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search for topics" className="pl-9" />
      </div>
      
      <div className="space-y-1">
        <Button className="w-full justify-start text-base bg-secondary text-secondary-foreground">Latest</Button>
        <Button variant="ghost" className="w-full justify-start text-base">Popular</Button>
        <Button variant="ghost" className="w-full justify-start text-base">Older</Button>
      </div>

      <div>
        <h3 className="text-base font-bold flex justify-between items-center mb-2">
            <span>Categories (5)</span>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </h3>
        <ul className="space-y-1">
          {categories.map(cat => (
            <li key={cat}>
              <Button variant={cat === 'Technology' ? 'ghost' : 'ghost'} className="w-full justify-start rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                <Dot className="mr-2 h-5 w-5 text-green-500" /> {cat}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-base font-bold flex justify-between items-center mb-2">
            <span>Topic (3)</span>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </h3>
        <ul className="space-y-1">
          {topics.map(topic => (
            <li key={topic}>
              <Button variant={topic === 'Computer' ? 'ghost' : 'ghost'} className="w-full justify-start rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                  <Dot className="mr-2 h-5 w-5 text-blue-500" /> {topic}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
