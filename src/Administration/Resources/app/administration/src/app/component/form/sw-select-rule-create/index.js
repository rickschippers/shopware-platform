import template from './sw-select-rule-create.html.twig';
import './sw-select-rule-create.scss';

const { Component } = Shopware;
const { Criteria } = Shopware.Data;

/**
 * @status ready
 * @description The <u>sw-select-rule-create</u> component is used to create or select a rule.
 * @example-type code-only
 * @component-example
 * <sw-select-rule-create
 *     ruleId="0fd38734776f41e9a1ba431f1667e677"
 *     ruleFilter="ruleFilter"
 *     \@save-rule="onSaveRule"
 *     \@dismiss-rule="onDismissRule">
 * </sw-select-rule-create>
 */
Component.register('sw-select-rule-create', {
    template,

    inject: [
        'repositoryFactory',
        'feature',
        'ruleConditionDataProviderService',
    ],

    props: {
        ruleId: {
            type: String,
            required: false,
            default: null,
        },

        rules: {
            type: Array,
            required: false,
            default: null,
        },

        ruleFilter: {
            type: Object,
            required: false,
            default() {
                const criteria = new Criteria();
                criteria.addSorting(Criteria.sort('name', 'ASC', false));
                if (this.feature.isActive('FEATURE_NEXT_18215')) {
                    criteria.addAssociation('conditions');
                }

                return criteria;
            },
        },

        /* @internal (flag:FEATURE_NEXT_18215) */
        ruleAwareGroupKey: {
            type: String,
            required: false,
            default: null,
        },
    },

    data() {
        return {
            itemAddNewRule: {
                index: -1,
                id: '',
            },
            showRuleModal: false,
            /* @internal (flag:FEATURE_NEXT_18215) */
            restrictedRules: [],
        };
    },

    computed: {
        collection: {
            get() {
                return this.rules;
            },
            set(collection) {
                collection.forEach((item) => {
                    if (!this.rules.has(item.id)) {
                        this.rules.add(item);
                    }
                });
                this.rules.forEach((item) => {
                    if (!collection.has(item.id)) {
                        this.rules.remove(item.id);
                    }
                });
            },
        },
    },

    methods: {
        onSaveRule(ruleId, rule) {
            if (this.rules) {
                this.rules.add(rule);
            }

            this.$emit('save-rule', ruleId, rule);
        },

        onSelectRule(event) {
            if (event !== this.ruleId) {
                this.onSaveRule(event);
            }
        },

        openCreateRuleModal() {
            this.showRuleModal = true;
        },

        onCloseRuleModal() {
            this.showRuleModal = false;
        },

        onRuleSelectInput(event) {
            if (!event) {
                this.$emit('dismiss-rule');
            }
        },

        /* @internal (flag:FEATURE_NEXT_18215) */
        isRuleRestricted(rule) {
            if (!this.feature.isActive('FEATURE_NEXT_18215')) {
                return false;
            }

            return this.ruleConditionDataProviderService.isRuleRestricted(rule.conditions, this.ruleAwareGroupKey);
        },

        /* @internal (flag:FEATURE_NEXT_18215) */
        tooltipConfig(rule) {
            return this.ruleConditionDataProviderService.getRestrictedRuleTooltipConfig(
                rule.conditions,
                this.ruleAwareGroupKey,
            );
        },
    },
});
