// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import moment from 'moment';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';
import styles from './Transaction.scss';
import TransactionTypeIcon from './TransactionTypeIcon.js';
import adaSymbol from '../../../assets/images/ada-symbol.inline.svg';
import arrow from '../../../assets/images/collapse-arrow.inline.svg';
import {
  transactionStates,
  transactionTypes,
  TxnAssuranceLevelOptions,
  WalletTransaction,
} from '../../../domains/WalletTransaction';
import { MAX_TRANSACTION_CONFIRMATIONS } from '../../../config/numbersConfig';
import globalMessages from '../../../i18n/global-messages';
import type { TransactionState } from '../../../api/transactions/types';
import { getNetworkExplorerUrl } from '../../../utils/network';

const messages = defineMessages({
  card: {
    id: 'wallet.transaction.type.card',
    defaultMessage: '!!!Card payment',
    description: 'Transaction type shown for credit card payments.',
  },
  type: {
    id: 'wallet.transaction.type',
    defaultMessage: '!!!{currency} transaction',
    description: 'Transaction type shown for {currency} transactions.',
  },
  exchange: {
    id: 'wallet.transaction.type.exchange',
    defaultMessage: '!!!Exchange',
    description:
      'Transaction type shown for money exchanges between currencies.',
  },
  assuranceLevel: {
    id: 'wallet.transaction.assuranceLevel',
    defaultMessage: '!!!Transaction assurance level',
    description: 'Transaction assurance level.',
  },
  confirmations: {
    id: 'wallet.transaction.confirmations',
    defaultMessage: '!!!confirmations',
    description: 'Transaction confirmations.',
  },
  transactionId: {
    id: 'wallet.transaction.transactionId',
    defaultMessage: '!!!Transaction ID',
    description: 'Transaction ID.',
  },
  conversionRate: {
    id: 'wallet.transaction.conversion.rate',
    defaultMessage: '!!!Conversion rate',
    description: 'Conversion rate.',
  },
  sent: {
    id: 'wallet.transaction.sent',
    defaultMessage: '!!!{currency} sent',
    description: 'Label "{currency} sent" for the transaction.',
  },
  received: {
    id: 'wallet.transaction.received',
    defaultMessage: '!!!{currency} received',
    description: 'Label "{currency} received" for the transaction.',
  },
  fromAddress: {
    id: 'wallet.transaction.address.from',
    defaultMessage: '!!!From address',
    description: 'From address',
  },
  fromAddresses: {
    id: 'wallet.transaction.addresses.from',
    defaultMessage: '!!!From addresses',
    description: 'From addresses',
  },
  toAddress: {
    id: 'wallet.transaction.address.to',
    defaultMessage: '!!!To address',
    description: 'To address',
  },
  toAddresses: {
    id: 'wallet.transaction.addresses.to',
    defaultMessage: '!!!To addresses',
    description: 'To addresses',
  },
  transactionAmount: {
    id: 'wallet.transaction.transactionAmount',
    defaultMessage: '!!!Transaction amount',
    description: 'Transaction amount.',
  },
});

const assuranceLevelTranslations = defineMessages({
  [TxnAssuranceLevelOptions.LOW]: {
    id: 'wallet.transaction.assuranceLevel.low',
    defaultMessage: '!!!low',
    description: 'Transaction assurance level "low".',
  },
  [TxnAssuranceLevelOptions.MEDIUM]: {
    id: 'wallet.transaction.assuranceLevel.medium',
    defaultMessage: '!!!medium',
    description: 'Transaction assurance level "medium".',
  },
  [TxnAssuranceLevelOptions.HIGH]: {
    id: 'wallet.transaction.assuranceLevel.high',
    defaultMessage: '!!!high',
    description: 'Transaction assurance level "high".',
  },
});

const stateTranslations = defineMessages({
  [transactionStates.PENDING]: {
    id: 'wallet.transaction.state.pending',
    defaultMessage: '!!!Transaction pending',
    description: 'Transaction state "pending"',
  },
  [transactionStates.FAILED]: {
    id: 'wallet.transaction.state.failed',
    defaultMessage: '!!!Transaction failed',
    description: 'Transaction state "pending"',
  },
});

type Props = {
  data: WalletTransaction,
  state: TransactionState,
  assuranceLevel: string,
  isExpanded: boolean,
  isRestoreActive: boolean,
  isLastInList: boolean,
  formattedWalletAmount: Function,
  network: string,
  onDetailsToggled: ?Function,
  onOpenExternalLink: ?Function,
};

export default class Transaction extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  toggleDetails() {
    const { onDetailsToggled } = this.props;
    if (onDetailsToggled) onDetailsToggled();
  }

  handleOpenExplorer(type: string, param: string, e: Event) {
    const { onOpenExternalLink, network } = this.props;
    if (onOpenExternalLink) {
      e.stopPropagation();
      const link = `${getNetworkExplorerUrl(network)}/${type}/${param}`;
      onOpenExternalLink(link);
    }
  }

  displayNumberOfConfirmations = (confirmations: number) => {
    let text = Math.min(
      confirmations,
      MAX_TRANSACTION_CONFIRMATIONS
    ).toLocaleString();
    if (confirmations > MAX_TRANSACTION_CONFIRMATIONS) text += '+';
    return text;
  };

  render() {
    const {
      data,
      isLastInList,
      state,
      assuranceLevel,
      formattedWalletAmount,
      onOpenExternalLink,
      isRestoreActive,
      isExpanded,
    } = this.props;
    const { intl } = this.context;

    const canOpenExplorer = onOpenExternalLink;

    const hasConfirmations = data.numberOfConfirmations > 0;
    const isFailedTransaction = state === transactionStates.FAILED;
    const isPendingTransaction =
      state === transactionStates.PENDING ||
      (state === transactionStates.OK && !hasConfirmations);

    // transaction state is mutated in order to capture zero-confirmations status as pending state
    const transactionState = isPendingTransaction
      ? transactionStates.PENDING
      : state;

    const componentStyles = classNames([
      styles.component,
      isFailedTransaction ? styles.failed : null,
      isExpanded ? 'Transaction_expanded' : null,
    ]);

    const contentStyles = classNames([
      styles.content,
      isLastInList ? styles.last : null,
      isExpanded ? styles.contentExpanded : null,
    ]);

    const detailsStyles = classNames([
      styles.details,
      canOpenExplorer ? styles.clickable : null,
      isExpanded ? styles.detailsExpanded : styles.detailsClosed,
    ]);

    const assuranceLevelRowStyles = classNames([
      styles.row,
      styles.retainHeight,
    ]);

    const arrowStyles = classNames([
      styles.arrow,
      isExpanded ? styles.arrowExpanded : null,
    ]);

    const status = intl.formatMessage(
      assuranceLevelTranslations[assuranceLevel]
    );
    const currency = intl.formatMessage(globalMessages.currency);
    const symbol = adaSymbol;

    const transactionStateTag = () => {
      if (isRestoreActive) return;
      return transactionState === transactionStates.OK ? (
        <div className={styles[assuranceLevel]}>{status}</div>
      ) : (
        <div className={styles[`${transactionState}Label`]}>
          {intl.formatMessage(stateTranslations[transactionState])}
        </div>
      );
    };

    return (
      <div
        onClick={this.toggleDetails.bind(this)}
        className={componentStyles}
        role="presentation"
        aria-hidden
      >
        <div className={styles.toggler}>
          <TransactionTypeIcon
            iconType={
              isFailedTransaction ? transactionStates.FAILED : data.type
            }
          />

          <div className={styles.togglerContent}>
            <div className={styles.header}>
              <div className={styles.title}>
                {data.type === transactionTypes.EXPEND
                  ? intl.formatMessage(messages.sent, { currency })
                  : intl.formatMessage(messages.received, { currency })}
              </div>
              <div className={styles.amount}>
                {// hide currency (we are showing symbol instead)
                formattedWalletAmount(data.amount, false)}
                <SVGInline svg={symbol} className={styles.currencySymbol} />
              </div>
            </div>

            <div className={styles.details}>
              <div className={styles.type}>
                {intl.formatMessage(messages.type, { currency })},{' '}
                {moment(data.date).format('hh:mm:ss A')}
              </div>
              {transactionStateTag()}
            </div>
          </div>
        </div>

        {/* ==== Toggleable Transaction Details ==== */}
        <div className={contentStyles}>
          <div
            className={detailsStyles}
            onClick={event => event.stopPropagation()}
            role="presentation"
            aria-hidden
          >
            <div>
              <h2>{intl.formatMessage(messages.fromAddresses)}</h2>
              {data.addresses.from.map((address, addressIndex) => (
                <span
                  role="presentation"
                  aria-hidden
                  key={`${data.id}-from-${address}-${addressIndex}`}
                  className={styles.address}
                  onClick={this.handleOpenExplorer.bind(
                    this,
                    'address',
                    address
                  )}
                >
                  {address}
                </span>
              ))}
              <h2>{intl.formatMessage(messages.toAddresses)}</h2>
              {data.addresses.to.map((address, addressIndex) => (
                <span
                  role="presentation"
                  aria-hidden
                  key={`${data.id}-to-${address}-${addressIndex}`}
                  className={styles.address}
                  onClick={this.handleOpenExplorer.bind(
                    this,
                    'address',
                    address
                  )}
                >
                  {address}
                </span>
              ))}

              <div className={assuranceLevelRowStyles}>
                <h2>{intl.formatMessage(messages.assuranceLevel)}</h2>
                {!isRestoreActive &&
                (transactionState === transactionStates.OK ||
                  transactionState === transactionStates.PENDING) ? (
                  <span>
                    {transactionState === transactionStates.OK && (
                      <span className={styles.assuranceLevel}>
                        {status}.&nbsp;
                      </span>
                    )}
                    {this.displayNumberOfConfirmations(
                      data.numberOfConfirmations
                    )}
                    &nbsp;
                    {intl.formatMessage(messages.confirmations)}.
                  </span>
                ) : null}
              </div>

              <h2>{intl.formatMessage(messages.transactionId)}</h2>
              <span
                role="presentation"
                aria-hidden
                className={styles.transactionId}
                onClick={this.handleOpenExplorer.bind(this, 'tx', data.id)}
              >
                {data.id}
              </span>
            </div>
            {/*
            <div>
              <h2>Description</h2>
              <span>{data.description !== '' ? data.description : 'No description yet'}</span>
            </div>
            */}
          </div>
          <SVGInline svg={arrow} className={arrowStyles} />
        </div>
      </div>
    );
  }
}
