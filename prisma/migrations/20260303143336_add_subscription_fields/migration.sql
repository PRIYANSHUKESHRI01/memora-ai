-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('free', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('inactive', 'active', 'cancelled');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "paymentSubscriptionId" TEXT,
ADD COLUMN     "planType" "PlanType" NOT NULL DEFAULT 'free',
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'inactive';
