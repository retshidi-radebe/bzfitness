'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  CalendarDays,
  LogOut,
  Menu,
  Sun,
  Moon,
  UserCog,
} from 'lucide-react'
import Image from 'next/image'
import { AdminThemeProvider, useAdminTheme } from '@/lib/admin-theme'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
}

const baseNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Attendance', href: '/admin/attendance', icon: Calendar },
  { label: 'Payments', href: '/admin/payments', icon: DollarSign },
  { label: 'Schedule', href: '/admin/schedule', icon: CalendarDays },
  { label: 'Contact', href: '/admin/contact', icon: MessageSquare },
]

function AdminLayoutContent({ children, title }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme, mounted } = useAdminTheme()
  const [currentUser, setCurrentUser] = useState<{ role: string; username: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setCurrentUser(data) })
      .catch(() => {})
  }, [])

  const navItems = currentUser?.role === 'superadmin'
    ? [...baseNavItems, { label: 'Users', href: '/admin/users', icon: UserCog }]
    : baseNavItems

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setMobileMenuOpen(false)
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b flex items-center gap-3">
                      <Image src="/BZ.png" alt="BZ Fitness" width={40} height={40} className="object-contain" />
                      <div>
                        <h2 className="font-bold text-lg">BZ Fitness</h2>
                        <p className="text-xs text-muted-foreground">Admin Dashboard</p>
                      </div>
                    </div>
                    <nav className="flex-1 p-4">
                      <ul className="space-y-2">
                        {navItems.map((item) => (
                          <li key={item.href}>
                            <button
                              onClick={() => handleNavigation(item.href)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive(item.href)
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              <item.icon className="h-5 w-5" />
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    <div className="p-4 border-t space-y-2">
                      {mounted && (
                        <Button onClick={toggleTheme} variant="outline" className="w-full flex items-center gap-2">
                          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </Button>
                      )}
                      <Button onClick={handleLogout} variant="outline" className="w-full flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <Image src="/BZ.png" alt="BZ Fitness" width={36} height={36} className="object-contain hidden sm:block" />
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1 ml-6">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className={
                      isActive(item.href)
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white'
                    }
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>

            {/* Right side: username + role badge + theme + logout */}
            <div className="hidden sm:flex items-center gap-2">
              {currentUser && (
                <div className="flex items-center gap-2 mr-1">
                  <span className="text-sm text-muted-foreground">{currentUser.username}</span>
                  <Badge
                    variant={currentUser.role === 'superadmin' ? 'destructive' : 'secondary'}
                    className="text-xs capitalize"
                  >
                    {currentUser.role}
                  </Badge>
                </div>
              )}
              {mounted && (
                <Button
                  onClick={toggleTheme}
                  variant="ghost"
                  size="icon"
                  title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  className="text-gray-700 dark:text-gray-200"
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent title={title}>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  )
}
