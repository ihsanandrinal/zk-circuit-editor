# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ZK Circuit Editor and proof playground built with Next.js 15, React 19, TypeScript, and Tailwind CSS. The project integrates MidnightJS for zero-knowledge proof generation and circuit compilation. It's configured with shadcn/ui components for building the user interface.

## Development Commands

- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Architecture

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui component system
- **Component Library**: shadcn/ui with "new-york" style and Lucide icons
- **TypeScript**: Strict mode enabled with path aliases (`@/*` maps to root)
- **Fonts**: Geist Sans and Geist Mono from next/font/google

## Key Configuration

- **Component aliases**: Components at `@/components`, utilities at `@/lib/utils`
- **shadcn/ui**: Configured with neutral base color and CSS variables
- **TypeScript**: Strict configuration with ES2017 target
- **ESLint**: Next.js recommended configuration

## ZK Proof Integration

- **MidnightJS Dependencies**: Core ZK proving libraries installed
- **ZK Service**: `src/services/zkService.js` - Core service for proof generation
- **Test Harness**: `src/services/zkService.test.js` - Testing utilities and validation
- **Demo Component**: `src/components/ZkProofDemo.jsx` - Interactive proof playground UI
- **Environment**: `.env.local` - Configure MIDNIGHT_ENDPOINT for network connection

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `src/services/` - ZK proof generation services and utilities
- `src/components/` - React components including ZK proof demo
- `public/` - Static assets (SVG icons)
- `components.json` - shadcn/ui configuration
- Main entry point: `app/page.tsx` (displays ZkProofDemo)
- Global styles: `app/globals.css`