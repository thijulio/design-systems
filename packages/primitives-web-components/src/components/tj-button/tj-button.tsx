import { AttachInternals, Component, Host, Prop, h } from '@stencil/core';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'soft'
  | 'ghost'
  | 'danger'
  | 'danger-outline';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'primary',
  accent: 'accent',
  secondary: 'secondary',
  soft: 'soft',
  ghost: 'ghost',
  danger: 'danger',
  'danger-outline': 'dangerOutline',
};

/**
 * Button — brand-agnostic action control. Same skin as the React primitive:
 * the shadow root loads @thijulio/primitives' Button.module.css as plain CSS,
 * and every colour resolves through the inherited `--ds-*` contract.
 *
 * @part control - the native button (or anchor when `href` is set)
 * @slot - the label
 */
@Component({
  tag: 'tj-button',
  styleUrls: [
    '../../styles/shadow-reset.css',
    '../../../../primitives/src/lib/Button/Button.module.css',
    'tj-button.css',
  ],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class TjButton {
  @AttachInternals() internals!: ElementInternals;

  /** Intent. primary = brand fill, accent = accent fill; the rest as named. */
  @Prop() variant: ButtonVariant = 'primary';
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';
  /** Render a link when supplied; disabled links remain disabled buttons. */
  @Prop() href?: string;
  @Prop({ reflect: true }) disabled = false;
  @Prop() type: 'button' | 'submit' | 'reset' = 'button';

  // A button inside a shadow root can't submit the light-DOM form it sits in,
  // so form-associated submit/reset go through ElementInternals.
  private onClick = () => {
    const form = this.internals.form;
    if (!form || this.disabled) return;
    if (this.type === 'submit') form.requestSubmit();
    if (this.type === 'reset') form.reset();
  };

  render() {
    const classes = {
      btn: true,
      [this.size]: true,
      [VARIANT_CLASS[this.variant]]: true,
    };
    return (
      <Host>
        {this.href && !this.disabled ? (
          <a part="control" class={classes} href={this.href}>
            <slot />
          </a>
        ) : (
          <button
            part="control"
            class={classes}
            type="button"
            disabled={this.disabled}
            onClick={this.onClick}
          >
            <slot />
          </button>
        )}
      </Host>
    );
  }
}
