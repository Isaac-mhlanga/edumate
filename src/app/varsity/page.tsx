
'use client';

import React, { useState } from 'react';
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Files, ShieldCheck } from 'lucide-react';
import { EnquiryDialog } from '@/components/enquiry-dialog';

export default function VarsityPage() {
    const [isEnquiryDialogOpen, setIsEnquiryDialogOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <PublicHeader />
            <main className="flex-1">
                <section id="varsity-support" className="py-24 bg-background animate-fade-in-up">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <Badge>Varsity &amp; College Support</Badge>
                            <h1 className="text-4xl md:text-5xl font-headline font-bold my-4">
                                Excel in Your Tertiary Studies
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                                Stuck on a complex assignment, project, or research paper? Our team of experts provides specialized assistance for university and college students at all levels.
                            </p>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-8">
                            <Card className="animate-fade-in-up border transition-shadow duration-300 hover:shadow-xl" style={{ animationDelay: '0.2s' }}>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 text-primary p-3 rounded-full">
                                            <Files className="w-6 h-6" />
                                        </div>
                                        <CardTitle>Undergraduate Modules</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-muted-foreground">Get help with foundational concepts and challenging assignments in your early university years.</p>
                                    {[
                                        "Computer Science 1: Fundamentals of Programming",
                                        "Computer Science 2: Data Structures & Algorithms",
                                        "Computer Science 3: Advanced Algorithms & AI",
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                            <span className="font-medium">{item}</span>
                                        </div>
                                    ))}
                                    <p className="text-sm text-muted-foreground pt-2">...and more.</p>
                                </CardContent>
                            </Card>
                            <Card className="animate-fade-in-up border transition-shadow duration-300 hover:shadow-xl" style={{ animationDelay: '0.4s' }}>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 text-primary p-3 rounded-full">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <CardTitle>Honours &amp; Postgraduate</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-muted-foreground">Specialized support for advanced topics, research projects, and in-depth analysis.</p>
                                    {[
                                        "Advanced Information Security & Cryptography",
                                        "Information Security Risk Analysis & Management",
                                        "Forensic Computing & Digital Investigations",
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                            <span className="font-medium">{item}</span>
                                        </div>
                                    ))}
                                    <p className="text-sm text-muted-foreground pt-2">...and more.</p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                            <Button size="lg" onClick={() => setIsEnquiryDialogOpen(true)}>
                                Enquire Now for Tertiary Support <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </section>
                <Footer />
            </main>
            <EnquiryDialog isOpen={isEnquiryDialogOpen} setIsOpen={setIsEnquiryDialogOpen} />
        </div>
    );
}
