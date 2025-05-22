/**
 * External dependencies
 */
import { type ReactNode } from 'react';
import {
	type RecommendedPaymentMethod,
	type PaymentProvider,
} from '@woocommerce/data';

/**
 * Internal dependencies
 */
import {
	Country,
	MccsDisplayTreeItem,
} from './providers/woopayments/steps/business-verification/types'; // To-do: Maybe move to @woocommerce/data

/**
 * Props for the Onboarding Modal component.
 */
export interface OnboardingModalProps {
	setIsOpen: ( isOpen: boolean ) => void;
	children?: ReactNode;
}

/**
 * Sidebar navigation item props
 */
export interface SidebarItemProps {
	label: string;
	isCompleted?: boolean;
	isActive?: boolean;
}

/**
 * Props for the WooPayments onboarding modal.
 */
export interface WooPaymentsModalProps {
	isOpen: boolean;
	setIsOpen: ( isOpen: boolean ) => void;
	providerData: PaymentProvider;
}

/**
 * WooPayments provider onboarding step that extends the base WooPaymentsOnboardingStepContent
 * with additional fields specific to the provider implementation.
 */
export interface WooPaymentsProviderOnboardingStep {
	id: string;
	type: 'backend' | 'frontend';
	label: string;
	path?: string;
	order: number;
	status?: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'blocked';
	dependencies?: string[];
	actions?: {
		save?: {
			type?: string;
			href?: string;
		};
		start?: {
			type?: string;
			href?: string;
		};
		finish?: {
			type?: string;
			href?: string;
		};
		init?: {
			type?: string;
			href?: string;
		};
		clean?: {
			type?: string;
			href?: string;
		};
		check?: {
			type?: string;
			href?: string;
		};
		kyc_fallback?: {
			type?: string;
			href?: string;
		};
		kyc_session?: {
			type?: string;
			href?: string;
		};
		kyc_session_finish?: {
			type?: string;
			href?: string;
		};
		auth?: {
			type?: string;
			href?: string;
		};
	};
	content?: ReactNode;
	context?: {
		recommended_pms: RecommendedPaymentMethod[];
		pms_state: Record< string, boolean >;
		overview_page_url?: string;
		fields: {
			business_types: Country[];
			industry_to_mcc: Record< string, string >;
			mccs_display_tree: MccsDisplayTreeItem;
			available_countries: Record< string, string >;
			location: string;
		};
		self_assessment: Record< string, string >;
		sub_steps: Record<
			string,
			{
				status: 'completed' | 'not_started' | 'started';
			}
		>;
		has_test_account?: boolean;
	};
	errors?: {
		message: string;
		code: string;
	}[];
}

/**
 * WooPayments provider onboarding context type.
 */
export interface OnboardingContextType {
	steps: WooPaymentsProviderOnboardingStep[];
	context: {
		urls?: {
			overview_page?: string;
		};
	};
	isLoading: boolean;
	currentStep: WooPaymentsProviderOnboardingStep | undefined;
	navigateToStep: ( stepKey: string ) => void;
	navigateToNextStep: () => void;
	getStepByKey: (
		stepKey: string
	) => WooPaymentsProviderOnboardingStep | undefined;
	refreshStoreData: () => void;
	closeModal: () => void;
	justCompletedStepId: string | null;
	setJustCompletedStepId: ( stepId: string ) => void;
}
