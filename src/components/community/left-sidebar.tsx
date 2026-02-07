'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, Dot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LeftSidebar() {
  const categories = ['Technology', 'Social', 'Reader', 'Sports', 'Political'];
  const topics = ['Computer', 'Mobile', 'Gaming'];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for topics" className="pl-9" />
          </div>
          <div className="mt-4 space-y-1">
            <Button className="w-full justify-start text-base">Latest</Button>
            <Button variant="ghost" className="w-full justify-start text-base">Popular</Button>
            <Button variant="ghost" className="w-full justify-start text-base">Older</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex justify-between items-center">
            <span>Categories (5)</span>
            <ChevronDown className="h-5 w-5" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {categories.map(cat => (
              <li key={cat}>
                <Button variant={cat === 'Technology' ? 'secondary' : 'ghost'} className="w-full justify-start rounded-full">
                  <Dot className="mr-2 h-5 w-5 text-green-500" /> {cat}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle className="text-base font-bold flex justify-between items-center">
            <span>Topic (3)</span>
            <ChevronDown className="h-5 w-5" />
            </CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-1">
            {topics.map(topic => (
                <li key={topic}>
                <Button variant={topic === 'Computer' ? 'secondary' : 'ghost'} className="w-full justify-start rounded-full">
                    <Dot className="mr-2 h-5 w-5 text-blue-500" /> {topic}
                </Button>
                </li>
            ))}
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
