"use client"

import { AnimatePresence, motion } from "motion/react"

export function AuthError({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          role="alert"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="overflow-hidden text-destructive text-sm"
        >
          <span className="block pt-1">{message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  )
}
