'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function ContactForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formElement = e.currentTarget
    
    // Validate package is selected
    if (!selectedPackage) {
      toast({
        title: 'Package Required',
        description: 'Please select a package option.',
        variant: 'destructive',
      })
      return
    }
    
    setIsSubmitting(true)

    const formData = new FormData(formElement)
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      package: selectedPackage,
      message: formData.get('message'),
    }

    console.log('Submitting form with data:', data)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      console.log('API Response:', result)

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Your message has been sent. We\'ll contact you soon!',
        })
        setSelectedPackage('')
        if (formElement) {
          formElement.reset()
        }
      } else {
        console.error('API Error:', result)
        throw new Error(result.error || 'Failed to submit')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send your message. Please try again or contact us on WhatsApp.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Your full name"
          suppressHydrationWarning
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone / WhatsApp *</Label>
        <Input
          id="phone"
          name="phone"
          required
          type="tel"
          placeholder="062 923 9411"
          suppressHydrationWarning
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          suppressHydrationWarning
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="package">Which package / session you want? *</Label>
        <Select 
          name="package" 
          required 
          value={selectedPackage}
          onValueChange={setSelectedPackage}
        >
          <SelectTrigger suppressHydrationWarning>
            <SelectValue placeholder="Select a package" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="package-1">Package 1 - R50/month (50% OFF)</SelectItem>
            <SelectItem value="package-2">Package 2 - R85/month (50% OFF)</SelectItem>
            <SelectItem value="package-3">Package 3 - R125/month (50% OFF)</SelectItem>
            <SelectItem value="unsure">Not sure yet</SelectItem>
            <SelectItem value="other">Other inquiry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Tell us about your fitness goals or any questions..."
          rows={4}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isSubmitting}
        suppressHydrationWarning
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  )
}
