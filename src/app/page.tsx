'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/components/contact-form'
import { Users, Target, Calendar, MapPin, Phone, Mail, Clock, ArrowRight, Star, CheckCircle2 } from 'lucide-react'

interface ScheduleItem {
  id: string
  dayOfWeek: string
  timeSlot: string
  activity: string
  isActive: boolean
}

const DAY_ABBR: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
}

export default function Home() {
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(true)

  useEffect(() => {
    fetch('/api/schedule')
      .then(res => res.ok ? res.json() : [])
      .then(data => setScheduleData(data))
      .catch(() => setScheduleData([]))
      .finally(() => setScheduleLoading(false))
  }, [])

  const morningSchedule = scheduleData.filter(s => s.timeSlot === '6:30 AM' && s.dayOfWeek !== 'Saturday')
  const eveningSchedule = scheduleData.filter(s => s.timeSlot === '5:00 PM' && s.dayOfWeek !== 'Saturday')
  const saturdaySchedule = scheduleData.filter(s => s.dayOfWeek === 'Saturday')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/BZ.png" alt="BZ Fitness" className="h-14 w-14 object-contain" />
              <span className="text-xl font-bold">BZ Fitness</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-sm font-medium hover:text-green-600 transition-colors">About</a>
              <a href="#programs" className="text-sm font-medium hover:text-green-600 transition-colors">Programs</a>
              <a href="#contact" className="text-sm font-medium hover:text-green-600 transition-colors">Contact</a>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="https://wa.me/27629239411?text=Hi%20BZ%20Fitness%20-%20I%27m%20interested%20in%20joining">
                  Join Now
                </a>
              </Button>
            </div>
            <Button asChild className="md:hidden bg-green-600 hover:bg-green-700" size="sm">
              <a href="https://wa.me/27629239411?text=Hi%20BZ%20Fitness%20-%20I%27m%20interested%20in%20joining">
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 bg-gradient-to-br from-green-50 to-orange-50 dark:from-green-950/20 dark:to-orange-950/20">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
              BZ Fitness and Wellness
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Transform your body, Elevate your mind — affordable community fitness in Tseki.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8">
                <a href="#programs">
                  Join a session
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 border-green-600 text-green-600 hover:bg-green-50">
                <a href="https://wa.me/27629239411?text=Hi%20BZ%20Fitness%20-%20I%27m%20interested%20in%20joining" target="_blank" rel="noopener noreferrer">
                  Message on WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* Short Intro */}
          <div className="max-w-3xl mx-auto mt-12 md:mt-16">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              BZ Fitness and Wellness is a community-driven programme offering group training, body transformation plans and lifestyle coaching for all ages. We run morning and evening sessions at Setsoto Intermediate School and welcome everyone — no experience needed.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="py-8 bg-white dark:bg-gray-900 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-green-600" />
              <span className="font-semibold text-sm md:text-base">Group training</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Target className="h-8 w-8 text-orange-600" />
              <span className="font-semibold text-sm md:text-base">Body transformation</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="h-8 w-8 text-green-600" />
              <span className="font-semibold text-sm md:text-base">Personal training</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-orange-600" />
              <span className="font-semibold text-sm md:text-base">R30 registration</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for our community</h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              BZ Fitness and Wellness was created to give Tseki a friendly, affordable place to get active. We focus on practical workouts, real results, and steady, healthy progress. Our team provides personalized support to help beginners and experienced members achieve their fitness goals.
            </p>
          </div>

          {/* Trainers */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 border-green-100 dark:border-green-900">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-center text-xl">Beezy Mahlaba</CardTitle>
                <CardDescription className="text-center">Head coach</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground">
                  Group classes & lifestyle wellness
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 dark:border-orange-900">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-center text-xl">Retshidi Bello R.</CardTitle>
                <CardDescription className="text-center">Personal trainer</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground">
                  One-on-one coaching & weight management specialist
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our programmes & rates</h2>
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Setsoto Intermediate School Hall, Tseki</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Registration: R30 once-off</p>
          </div>

          {/* Schedule */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduleLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
                ) : scheduleData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Schedule coming soon</div>
                ) : (
                  <>
                    {/* 6:30 AM Sessions */}
                    {morningSchedule.length > 0 && (
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-green-800 dark:text-green-200">6:30 AM</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                          {morningSchedule.map((item) => (
                            <div key={item.id} className="p-2 bg-white dark:bg-gray-800 rounded">
                              <div className="font-semibold text-green-600">{DAY_ABBR[item.dayOfWeek] || item.dayOfWeek}</div>
                              <div>{item.activity}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5:00 PM Sessions */}
                    {eveningSchedule.length > 0 && (
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="font-bold text-orange-800 dark:text-orange-200">5:00 PM</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                          {eveningSchedule.map((item) => (
                            <div key={item.id} className="p-2 bg-white dark:bg-gray-800 rounded">
                              <div className="font-semibold text-orange-600">{DAY_ABBR[item.dayOfWeek] || item.dayOfWeek}</div>
                              <div>{item.activity}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Saturday */}
                    {saturdaySchedule.length > 0 && (
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gradient-to-r from-green-50 to-orange-50 dark:from-green-950/20 dark:to-orange-950/20 rounded-lg">
                        <div className="font-semibold">Saturday</div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm mt-2 md:mt-0">
                          {saturdaySchedule.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{item.activity} - {item.timeSlot}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Services */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Group fitness training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Structured group sessions, equipment provided where needed. Perfect for motivation and community support.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Body transformation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  8–12 week plans with check-ups and progress tracking. Achieve real results with personalised support.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Wellness & lifestyle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nutrition tips and mindset sessions. Transform not just your body, but your whole lifestyle.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pricing */}
          <div className="max-w-5xl mx-auto">
            {/* February Promotion Banner */}
            <div className="mb-8 bg-gradient-to-r from-green-500 to-orange-500 rounded-2xl p-6 text-white text-center">
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1">
                  <p className="text-2xl md:text-3xl font-bold mb-1">🎉 50% OFF FOR FEBRUARY!</p>
                  <p className="text-sm md:text-base opacity-90">Join any package this month and save 50%</p>
                </div>
                <div className="hidden md:flex text-6xl animate-bounce">
                  ⚡
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center mb-8">Choose your package</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Package 1 */}
              <Card className="border-2 hover:border-green-400 transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1">
                  50% OFF
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Package 1</CardTitle>
                  <CardDescription>Perfect for beginners</CardDescription>
                  <div className="mt-4">
                    <span className="text-lg text-muted-foreground line-through mr-2">R100</span>
                    <span className="text-4xl font-bold text-green-600">R50</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      1 session on weekdays
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      1 scaling per month
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Package 2 - Featured */}
              <Card className="border-4 border-green-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1">
                  50% OFF
                </div>
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1">
                  POPULAR
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Package 2</CardTitle>
                  <CardDescription>Best value</CardDescription>
                  <div className="mt-4">
                    <span className="text-lg text-muted-foreground line-through mr-2">R170</span>
                    <span className="text-4xl font-bold text-green-600">R85</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Unlimited sessions weekly
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      5 scalings per month
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Package 3 */}
              <Card className="border-2 hover:border-orange-400 transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-orange-500 text-white text-xs font-bold px-3 py-1">
                  50% OFF
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Package 3</CardTitle>
                  <CardDescription>Premium experience</CardDescription>
                  <div className="mt-4">
                    <span className="text-lg text-muted-foreground line-through mr-2">R250</span>
                    <span className="text-4xl font-bold text-orange-600">R125</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-orange-600" />
                      5 hours private session/month
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-orange-600" />
                      Personalised diet plan
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-orange-600" />
                      Regular check-ups
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-orange-600" />
                      Unlimited scaling/month
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8">
                <a href="https://wa.me/27629239411?text=Hi%20BZ%20Fitness%20-%20I%27d%20like%20to%20reserve%20a%20spot" target="_blank" rel="noopener noreferrer">
                  Reserve a spot
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Get in touch / Register</h2>
            <p className="text-lg text-muted-foreground">
              Ready to start your fitness journey? Contact us today!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    Contact Numbers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild variant="outline" className="w-full justify-start border-green-600 text-green-600 hover:bg-green-50">
                    <a href="https://wa.me/27629239411?text=Hello%20BZ%20Fitness%20-%20I%27d%20like%20to%20register" target="_blank" rel="noopener noreferrer">
                      <Phone className="h-4 w-4 mr-2" />
                      062 9239 411
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start border-green-600 text-green-600 hover:bg-green-50">
                    <a href="https://wa.me/27655790297?text=Hello%20BZ%20Fitness%20-%20I%27d%20like%20to%20register" target="_blank" rel="noopener noreferrer">
                      <Phone className="h-4 w-4 mr-2" />
                      065 579 0297
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Setsoto Primary School</p>
                  <p className="text-sm text-muted-foreground">Tseki</p>
                  <div className="mt-4 rounded-lg overflow-hidden border">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3298.4109258650774!2d28.772726900000002!3d-28.578583499999993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ef2b17b7ea82d35%3A0x3f2b73a615315795!2sSetsoto%20Primary%20School!5e1!3m2!1sen!2sza!4v1769764106848!5m2!1sen!2sza"
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <Button asChild className="w-full mt-4" variant="outline">
                    <a
                      href="https://share.google/00otpG3OUvtGdoWuf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Open in Google Maps
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  💡 Note: Registration is R30 once-off. Payment and in-person signups accepted at sessions.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>Fill in the form below and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/BZ.png" alt="BZ Fitness" className="h-12 w-12 object-contain" />
                <span className="font-bold text-lg">BZ Fitness</span>
              </div>
              <p className="text-sm text-gray-400">
                Transform your body, Elevate your mind — affordable community fitness in Tseki.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#programs" className="hover:text-white transition-colors">Programs</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  062 9239 411
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Setsoto Intermediate School, Tseki
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  bzfitnessandwellness@outlook.com
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400 space-y-2">
            <p>© 2026 BZ Fitness and Wellness. All rights reserved.</p>
            <p className="text-xs">Developed and Maintained by PrimeCode Solutions</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
