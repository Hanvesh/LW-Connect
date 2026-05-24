import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, BookOpen, Sparkles, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Welcome to <span className="text-primary">LW-Connect</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Empowering public-sector innovation through mentorship, learning, and AI-assisted guidance
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Expert Mentors"
              description="Connect with experienced professionals in public sector innovation"
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Quality Courses"
              description="Access curated learning content designed for government professionals"
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="AI Assistant"
              description="Get personalized recommendations powered by artificial intelligence"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Track Progress"
              description="Monitor engagement and measure learning outcomes effectively"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of public sector professionals advancing their skills
          </p>
          <Link href="/login">
            <Button size="lg">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 LW-Connect (PeopleWave). All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
