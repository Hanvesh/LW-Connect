import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, Lightbulb, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About LW-Connect</h1>
          <p className="text-xl text-muted-foreground">
            Empowering public-sector innovation through mentorship and learning
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                LW-Connect (PeopleWave) is dedicated to fostering innovation in the public sector by
                connecting learners with experienced mentors, providing access to quality learning
                resources, and leveraging AI to personalize the learning journey.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                What We Offer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Expert Mentorship</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with seasoned professionals who understand the unique challenges of
                  public-sector innovation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Curated Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Access courses and resources specifically designed for government professionals
                  and innovation leaders.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">AI-Powered Guidance</h3>
                <p className="text-sm text-muted-foreground">
                  Receive personalized recommendations and career guidance powered by advanced AI.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cohort-Based Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Join structured programs with peers, fostering collaboration and shared growth.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Our Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">150+</p>
                  <p className="text-sm text-muted-foreground">Active Learners</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">28</p>
                  <p className="text-sm text-muted-foreground">Expert Mentors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">340+</p>
                  <p className="text-sm text-muted-foreground">Sessions Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
