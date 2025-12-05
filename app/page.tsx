import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="text-2xl font-bold text-primary">Krishi Connect</div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Connect Farmers with Fair Prices</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          A transparent marketplace for crop sales with government MSP assurance, direct buyer connections, and payment
          security.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Krishi Connect?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Direct Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect directly with buyers. No middlemen, no hidden costs. Get fair prices for your crops.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MSP Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access real-time government MSP prices. Get alerts when market prices fall below MSP and explore
                  government procurement options.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All transactions are secured with encrypted payments. Farmers and buyers have transaction protection.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Agricultural Business?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of farmers and buyers already using Krishi Connect.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg">Join Krishi Connect Today</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
