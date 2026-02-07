'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { QuestionForm } from './question-form';


export function RightSidebar() {
  const topMembers = [
    { name: 'Albert Flores', score: '13K', avatar: 'https://i.pravatar.cc/150?u=albert' },
    { name: 'Kathryn Murphy', score: '11K', avatar: 'https://i.pravatar.cc/150?u=kathryn' },
    { name: 'Savannah Nguyen', score: '10K', avatar: 'https://i.pravatar.cc/150?u=savannah' },
    { name: 'Floyd Miles', score: '10K', avatar: 'https://i.pravatar.cc/150?u=floyd' },
    { name: 'Darlene Robertson', score: '9K', avatar: 'https://i.pravatar.cc/150?u=darlene' },
    { name: 'Cameron Williamson', score: '8K', avatar: 'https://i.pravatar.cc/150?u=cameron' },
  ];
  const popularTags = ['Gaming', 'Console', 'Hardware', 'iphone', 'Best camera', 'Jio', 'resia in inαια'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold">Online</span>
        </div>
        <span className="text-sm font-semibold">35K members</span>
      </div>
      
      <QuestionForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Top Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {topMembers.map(member => (
              <li key={member.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{member.name}</span>
                </div>
                <span className="font-semibold text-muted-foreground">{member.score}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
          <CardTitle className="text-base font-bold">Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => <Button key={tag} variant="outline" size="sm">{tag}</Button>)}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
