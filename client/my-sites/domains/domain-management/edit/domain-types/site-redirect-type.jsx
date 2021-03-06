/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import config from 'config';
import { Card } from '@automattic/components';
import { withLocalizedMoment } from 'components/localized-moment';
import DomainStatus from '../card/domain-status';
import SubscriptionSettings from '../card/subscription-settings';
import { recordPaymentSettingsClick } from '../payment-settings-analytics';
import {
	getByPurchaseId,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'state/purchases/selectors';
import RenewButton from 'my-sites/domains/domain-management/edit/card/renew-button';
import AutoRenewToggle from 'me/purchases/manage-purchase/auto-renew-toggle';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { shouldRenderExpiringCreditCard } from 'lib/purchases';
import ExpiringCreditCard from '../card/notices/expiring-credit-card';
import DomainManagementNavigationEnhanced from '../navigation/enhanced';
import { WrapDomainStatusButtons } from './helpers';

class SiteRedirectType extends React.Component {
	resolveStatus() {
		const { translate, purchase } = this.props;

		if ( purchase && shouldRenderExpiringCreditCard( purchase ) ) {
			return {
				statusText: translate( 'Action required' ),
				statusClass: 'status-error',
				icon: 'info',
			};
		}

		return {
			statusText: translate( 'Active' ),
			statusClass: 'status-success',
			icon: 'check_circle',
		};
	}

	renderDefaultRenewButton() {
		const { domain, purchase } = this.props;

		if ( ! domain.currentUserCanManage ) {
			return null;
		}

		return (
			<div>
				<RenewButton
					compact={ true }
					purchase={ purchase }
					selectedSite={ this.props.selectedSite }
					subscriptionId={ parseInt( domain.subscriptionId, 10 ) }
					tracksProps={ { source: 'site-redirect-url', domain_status: domain.name } }
				/>
			</div>
		);
	}

	renderAutoRenewToggle() {
		const { selectedSite, purchase } = this.props;

		if ( ! purchase ) {
			return null;
		}

		const content = (
			<AutoRenewToggle
				planName={ selectedSite.plan.product_name_short }
				siteDomain={ selectedSite.domain }
				purchase={ purchase }
				compact={ true }
				withTextStatus={ true }
				toggleSource="site-redirect-status"
			/>
		);

		return content && <WrapDomainStatusButtons>{ content }</WrapDomainStatusButtons>;
	}

	renderAutoRenew() {
		const { isLoadingPurchase } = this.props;

		if ( isLoadingPurchase ) {
			return (
				<WrapDomainStatusButtons className="domain-types__auto-renew-placeholder">
					<p />
				</WrapDomainStatusButtons>
			);
		}

		return this.renderAutoRenewToggle();
	}

	handlePaymentSettingsClick = () => {
		this.props.recordPaymentSettingsClick( this.props.domain );
	};

	render() {
		const { domain, selectedSite, purchase, isLoadingPurchase, moment } = this.props;
		const { name: domain_name } = domain;

		const { statusText, statusClass, icon } = this.resolveStatus();

		const newStatusDesignAutoRenew = config.isEnabled( 'domains/new-status-design/auto-renew' );

		return (
			<div className="domain-types__container">
				{ selectedSite.ID && ! purchase && <QuerySitePurchases siteId={ selectedSite.ID } /> }
				<DomainStatus
					header={ domain_name }
					statusText={ statusText }
					statusClass={ statusClass }
					icon={ icon }
				>
					<ExpiringCreditCard
						selectedSite={ selectedSite }
						purchase={ purchase }
						domain={ domain }
					/>
				</DomainStatus>
				<Card compact={ true } className="domain-types__expiration-row">
					<div>
						{ this.props.translate( 'Expires: %(expiry_date)s', {
							args: {
								expiry_date: moment( domain.expiry ).format( 'LL' ),
							},
						} ) }
					</div>
					{ this.renderDefaultRenewButton() }
					{ ! newStatusDesignAutoRenew && domain.currentUserCanManage && (
						<WrapDomainStatusButtons>
							<SubscriptionSettings
								type={ domain.type }
								compact={ true }
								subscriptionId={ domain.subscriptionId }
								siteSlug={ this.props.selectedSite.slug }
								onClick={ this.handlePaymentSettingsClick }
							/>
						</WrapDomainStatusButtons>
					) }
					{ newStatusDesignAutoRenew && domain.currentUserCanManage && this.renderAutoRenew() }
				</Card>
				<DomainManagementNavigationEnhanced
					domain={ domain }
					selectedSite={ this.props.selectedSite }
					purchase={ purchase }
					isLoadingPurchase={ isLoadingPurchase }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { subscriptionId } = ownProps.domain;

		return {
			purchase: subscriptionId ? getByPurchaseId( state, parseInt( subscriptionId, 10 ) ) : null,
			isLoadingPurchase:
				isFetchingSitePurchases( state ) && ! hasLoadedSitePurchasesFromServer( state ),
		};
	},
	{
		recordPaymentSettingsClick,
	}
)( withLocalizedMoment( localize( SiteRedirectType ) ) );
