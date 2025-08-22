"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useWeb3 } from "@/lib/web3-context"
import {
  Globe,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  DollarSign,
  Clock,
  FileText,
  Gavel,
  ChevronLeft,
} from "lucide-react"
import Link from "next/link"

interface DomainVerification {
  isValid: boolean
  isOwned: boolean
  registrar: string
  expiryDate: string
  error?: string
}

export default function SubmitDomainPage() {
  const { account, isConnected } = useWeb3()
  const [formData, setFormData] = useState({
    domain: "",
    category: "",
    startingBid: "",
    reservePrice: "",
    auctionDuration: "7",
    description: "",
    agreeToTerms: false,
    agreeToFees: false,
  })

  const [domainVerification, setDomainVerification] = useState<DomainVerification | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const submissionFee = 0.05 // ETH
  const platformFee = 2.5 // percentage

  const handleDomainChange = (value: string) => {
    setFormData({ ...formData, domain: value })
    setDomainVerification(null)
  }

  const verifyDomain = async () => {
    if (!formData.domain || !isConnected) return

    setIsVerifying(true)
    setDomainVerification(null)

    try {
      // Mock domain verification - in real app, this would check ENS ownership
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const isValidDomain = formData.domain.endsWith(".eth") && formData.domain.length > 4
      const mockOwnership = Math.random() > 0.3 // 70% chance of ownership

      if (!isValidDomain) {
        setDomainVerification({
          isValid: false,
          isOwned: false,
          registrar: "",
          expiryDate: "",
          error: "Please enter a valid .eth domain",
        })
      } else if (!mockOwnership) {
        setDomainVerification({
          isValid: true,
          isOwned: false,
          registrar: "ENS Domains",
          expiryDate: "2025-12-31",
          error: "You don't own this domain or it's not connected to your wallet",
        })
      } else {
        setDomainVerification({
          isValid: true,
          isOwned: true,
          registrar: "ENS Domains",
          expiryDate: "2025-12-31",
        })
      }
    } catch (error) {
      setDomainVerification({
        isValid: false,
        isOwned: false,
        registrar: "",
        expiryDate: "",
        error: "Failed to verify domain ownership",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !domainVerification?.isOwned) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Mock submission process - in real app, this would interact with smart contracts
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simulate random success/failure
      if (Math.random() > 0.1) {
        setSubmitSuccess(true)
      } else {
        setSubmitError("Transaction failed. Please try again.")
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.domain &&
    formData.category &&
    formData.startingBid &&
    formData.description &&
    formData.agreeToTerms &&
    formData.agreeToFees &&
    domainVerification?.isOwned

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">G</span>
                </div>
                <span className="text-xl font-bold text-foreground">GogoBid</span>
              </Link>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/auctions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Auctions
                </Link>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  How it Works
                </a>
                <Link href="/submit" className="text-primary font-medium">
                  Submit Domain
                </Link>
              </div>
              <WalletConnectButton className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent" />
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Submission Successful!</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Your domain <span className="font-mono text-primary">{formData.domain}</span> has been submitted for review.
            Our curation team will review your submission within 24-48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/dashboard">View My Submissions</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auctions">Browse Auctions</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-foreground">GogoBid</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/auctions" className="text-muted-foreground hover:text-foreground transition-colors">
                Auctions
              </Link>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </a>
              <Link href="/submit" className="text-primary font-medium">
                Submit Domain
              </Link>
            </div>
            <WalletConnectButton className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent" />
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Submit Domain</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Submit Your Domain</h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Submit your premium domain for curation and auction on GogoBid. Our expert team reviews each submission to
            ensure quality and authenticity.
          </p>
        </div>

        {!isConnected ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to verify domain ownership and submit for auction.
              </p>
              <WalletConnectButton className="w-full" />
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Domain Information */}
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Domain Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain Name *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="domain"
                          placeholder="example.eth"
                          value={formData.domain}
                          onChange={(e) => handleDomainChange(e.target.value)}
                          className="bg-background border-border/50"
                        />
                        <Button
                          type="button"
                          onClick={verifyDomain}
                          disabled={!formData.domain || isVerifying}
                          variant="outline"
                          className="border-primary/20 text-primary hover:bg-primary/10 bg-transparent"
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Verifying
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Verify
                            </>
                          )}
                        </Button>
                      </div>

                      {domainVerification && (
                        <Alert className={domainVerification.isOwned ? "border-green-500/20" : "border-red-500/20"}>
                          {domainVerification.isOwned ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          )}
                          <AlertDescription>
                            {domainVerification.error ||
                              (domainVerification.isOwned
                                ? `Domain verified! You own ${formData.domain}`
                                : "Domain verification failed")}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="bg-background border-border/50">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finance">Finance & DeFi</SelectItem>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="gaming">Gaming & Metaverse</SelectItem>
                          <SelectItem value="art">Art & NFTs</SelectItem>
                          <SelectItem value="governance">Governance & DAOs</SelectItem>
                          <SelectItem value="brand">Brand & Marketing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your domain, its potential use cases, and why it would be valuable to bidders..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-background border-border/50 min-h-[120px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum 50 characters. Be specific about the domain's value proposition.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Auction Parameters */}
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gavel className="w-5 h-5" />
                      Auction Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startingBid">Starting Bid (ETH) *</Label>
                        <Input
                          id="startingBid"
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="1.0"
                          value={formData.startingBid}
                          onChange={(e) => setFormData({ ...formData, startingBid: e.target.value })}
                          className="bg-background border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reservePrice">Reserve Price (ETH)</Label>
                        <Input
                          id="reservePrice"
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Optional"
                          value={formData.reservePrice}
                          onChange={(e) => setFormData({ ...formData, reservePrice: e.target.value })}
                          className="bg-background border-border/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="auctionDuration">Auction Duration</Label>
                      <Select
                        value={formData.auctionDuration}
                        onValueChange={(value) => setFormData({ ...formData, auctionDuration: value })}
                      >
                        <SelectTrigger className="bg-background border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Days</SelectItem>
                          <SelectItem value="7">7 Days (Recommended)</SelectItem>
                          <SelectItem value="14">14 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Reserve price is the minimum amount you're willing to accept. If not met, the auction will not
                        complete and the domain remains with you.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Terms and Conditions */}
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Terms & Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="agreeToTerms" className="text-sm font-normal cursor-pointer">
                          I agree to the{" "}
                          <Link href="#" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and confirm that I own this domain and have the right to auction it.
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToFees"
                        checked={formData.agreeToFees}
                        onCheckedChange={(checked) => setFormData({ ...formData, agreeToFees: checked as boolean })}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="agreeToFees" className="text-sm font-normal cursor-pointer">
                          I understand and agree to pay the submission fee ({submissionFee} ETH) and platform fee (
                          {platformFee}% of final sale price).
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Fee Breakdown */}
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Fee Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Submission Fee</span>
                        <span className="font-semibold">{submissionFee} ETH</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Platform Fee</span>
                        <span className="font-semibold">{platformFee}% of sale</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Due Now</span>
                        <span className="font-semibold text-primary">{submissionFee} ETH</span>
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Submission fee is non-refundable and covers curation costs. Platform fee is only charged on
                        successful sales.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Process Timeline */}
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Process Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium">Submit Domain</div>
                          <div className="text-xs text-muted-foreground">Pay submission fee</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium">Curation Review</div>
                          <div className="text-xs text-muted-foreground">24-48 hours</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium">Auction Goes Live</div>
                          <div className="text-xs text-muted-foreground">If approved</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium">Auction Ends</div>
                          <div className="text-xs text-muted-foreground">Transfer & payment</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Card className="bg-card border-border/50">
                  <CardContent className="p-4">
                    {submitError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      size="lg"
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Domain
                          <Badge className="ml-2 bg-primary-foreground/20 text-primary-foreground">
                            {submissionFee} ETH
                          </Badge>
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center mt-2">
                      By submitting, you agree to transfer domain ownership upon successful auction completion.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
