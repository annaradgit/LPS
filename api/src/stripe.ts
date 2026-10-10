import Stripe from 'stripe';import {env,stripePrices} from './config.js';export const stripe=new Stripe(env.STRIPE_SECRET_KEY);export const cents=(n:number)=>Math.round(n*100);export {stripePrices};
