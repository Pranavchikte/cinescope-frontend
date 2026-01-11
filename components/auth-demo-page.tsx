"use client"

import { useState } from "react"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"

export function AuthDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">CineScope Auth Modal Demo</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Click the button below to see the authentication modal with login and registration forms.
        </p>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold"
        >
          Open Auth Modal
        </Button>

        <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  )
}
