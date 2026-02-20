'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { type Promotion } from '@/app/admin/page';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface AdminPromotionsTabProps {
    promotion: Promotion | null;
    onSave: (data: Promotion) => Promise<void>;
}

const promotionSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    buttonText: z.string().min(1, 'Button text is required'),
    buttonLink: z.string().url('Must be a valid URL'),
    icon: z.string().default('sparkles'),
});

export function AdminPromotionsTab({ promotion, onSave }: AdminPromotionsTabProps) {
    const [isSaving, setIsSaving] = React.useState(false);

    const form = useForm<z.infer<typeof promotionSchema>>({
        resolver: zodResolver(promotionSchema),
        defaultValues: {
            title: '',
            description: '',
            buttonText: '',
            buttonLink: 'https://www.tiktok.com/@edumate.pro',
            icon: 'tiktok',
        }
    });

    useEffect(() => {
        if (promotion) {
            form.reset(promotion);
        }
    }, [promotion, form]);

    const handleSubmit = async (data: z.infer<typeof promotionSchema>) => {
        setIsSaving(true);
        await onSave(data);
        setIsSaving(false);
    };

    return (
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <CardHeader>
                        <CardTitle>Homepage Promotion Banner</CardTitle>
                        <CardDescription>Manage the promotional banner displayed on the homepage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Follow us on TikTok!" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Get the latest updates, tips, and behind-the-scenes content." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="buttonText"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Text</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Follow Now" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="buttonLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Button Link</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                     <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex items-center gap-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="tiktok" id="icon-tiktok" />
                                                </FormControl>
                                                <Label htmlFor="icon-tiktok" className="flex items-center gap-2 font-normal">
                                                    <FaTiktok /> TikTok
                                                </Label>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="sparkles" id="icon-sparkles" />
                                                </FormControl>
                                                <Label htmlFor="icon-sparkles" className="flex items-center gap-2 font-normal">
                                                    <Sparkles /> General
                                                </Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Promotion
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}