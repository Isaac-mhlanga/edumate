
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag, Info, User, Download, Clock, Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, Paperclip, Users, BarChart, Loader2 } from 'lucide-react';
import { type UpcomingEvent } from '@/lib/data';
import { useReactToPrint } from 'react-to-print';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Icons } from './icons';

interface EventDialogProps {
  event: UpcomingEvent | null;
  allEvents: UpcomingEvent[];
  isOpen: boolean;
  onClose: () => void;
  onEventSelect: (event: UpcomingEvent) => void;
}

const EventPoster = React.forwardRef<HTMLDivElement, { event: UpcomingEvent }>(({ event }, ref) => (
  <div ref={ref} className="bg-card text-card-foreground p-8 print:p-0 print:bg-white print:text-black">
      <div className="border-4 border-primary p-6 rounded-lg relative bg-background print:border-black print:bg-gray-50">
        <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Icons.logo className="h-8 w-8 text-primary print:text-black" />
                <span className="text-xl font-bold print:text-black">EDUMATE</span>
            </div>
            <Badge variant="secondary" className="mb-2 print:bg-gray-200 print:text-black">{event.subject} - Grade {event.grade}</Badge>
            <h1 className="text-4xl font-bold text-primary print:text-black">{event.title}</h1>
            <p className="text-lg text-muted-foreground print:text-gray-600">An exclusive live session with {event.instructor}</p>
        </div>
        
        <Separator className="my-6 print:bg-gray-300" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary print:text-black" />
                <p>
                    {new Date(event.start).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary print:text-black" />
                <p>
                    {new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    {event.end && ` - ${new Date(event.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                </p>
            </div>
        </div>

        <div className="mt-6">
            <div className="flex items-start gap-3">
                <Info className="h-6 w-6 text-primary shrink-0 mt-1 print:text-black" />
                <p className="text-muted-foreground print:text-gray-700">{event.scope}</p>
            </div>
        </div>
    </div>
  </div>
));
EventPoster.displayName = 'EventPoster';


export function EventDialog({ event, allEvents, isOpen, onClose, onEventSelect }: EventDialogProps) {
  const posterRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = React.useState(false);
  
  const handlePrint = useReactToPrint({
    content: () => posterRef.current,
    documentTitle: `EdumatePro-Event-${event?.title.replace(/ /g, '_')}`,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        setIsPrinting(true);
        resolve();
      });
    },
    onAfterPrint: () => {
        setIsPrinting(false);
        toast({ title: "Poster Saved", description: "Your event poster PDF has been generated." });
    },
     onPrintError: () => {
        setIsPrinting(false);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate PDF.' });
    },
  });

  if (!event) return null;

  const shareOnSocial = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const url = window.location.href;
    const text = `Join this event on Edumate Pro: ${event.title}!`;
    let shareUrl = '';

    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(event.title)}&summary=${encodeURIComponent(text)}`;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link Copied!', description: 'The event link has been copied to your clipboard.' });
  }
  
  const otherEvents = allEvents.filter(e => e.id !== event.id).slice(0, 3);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <EventPoster event={event} ref={posterRef} />
        
        <Separator />

        <div className="space-y-4">
            <h4 className="font-semibold text-center">More Upcoming Events</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {otherEvents.map(otherEvent => (
                    <button key={otherEvent.id} onClick={() => onEventSelect(otherEvent)} className="text-left p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <p className="font-semibold text-sm line-clamp-1">{otherEvent.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(otherEvent.start).toLocaleDateString()}</p>
                    </button>
                ))}
            </div>
        </div>

        <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => shareOnSocial('twitter')}><Twitter className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => shareOnSocial('facebook')}><Facebook className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => shareOnSocial('linkedin')}><Linkedin className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={copyLink}><LinkIcon className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={handlePrint} disabled={isPrinting}>
              {isPrinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Download as PDF
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
