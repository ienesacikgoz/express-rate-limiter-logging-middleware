#!/bin/bash
# Development setup script for Express Rate Limiter & Logging Middleware

set -e

echo "🚀 Setting up Express Rate Limiter & Logging Middleware"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is not installed"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is not installed"; exit 1; }

echo -e "${GREEN}✓ All prerequisites installed${NC}"
echo ""

# Setup environment
echo -e "${BLUE}Setting up environment...${NC}"
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ Created .env from .env.example${NC}"
else
  echo -e "${YELLOW}⚠ .env already exists, skipping${NC}"
fi

# Create logs directory
mkdir -p logs
echo -e "${GREEN}✓ Created logs directory${NC}"

# Install dependencies
echo ""
echo -e "${BLUE}Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Run linter
echo ""
echo -e "${BLUE}Running linter...${NC}"
npm run lint || true
echo -e "${GREEN}✓ Lint check complete${NC}"

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo "Next steps:"
echo "  • Start dev:    npm run dev"
echo "  • Run tests:    npm test"
echo "  • Run linter:   npm run lint"
echo "  • Build Docker: npm run docker:build"
echo ""
