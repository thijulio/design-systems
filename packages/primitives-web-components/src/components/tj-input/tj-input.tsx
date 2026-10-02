import {
  AttachInternals,
  Component,
  Element,
  Event,
  type EventEmitter,
  Host,
  Prop,
  Watch,
  h,
} from '@stencil/core';

/**
 * Input — text control with the shared Input skin (the shadow root loads
 * @thijulio/primitives' Input.module.css). Form-associated: it submits with a
 * light-DOM <form> and reports its value through ElementInternals.
 *
 * @part control - the native input
 */
@Component({
  tag: 'tj-input',
  styleUrls: [
    '../../../../primitives/src/lib/Input/Input.module.css',
    'tj-input.css',
  ],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class TjInput {
  @Element() host!: HTMLElement;
  @AttachInternals() internals!: ElementInternals;

  @Prop({ mutable: true }) value = '';
  @Prop() name?: string;
  @Prop() placeholder?: string;
  @Prop() type: 'text' | 'email' | 'search' | 'tel' | 'url' | 'password' =
    'text';
  @Prop({ reflect: true }) disabled = false;
  @Prop() required = false;
  /** Flip to the danger outline. */
  @Prop({ reflect: true }) invalid = false;

  /** Fires on every edit with the current value (v-model / ngModel hook). */
  @Event() tjInput!: EventEmitter<string>;
  /** Fires when the value is committed (blur / enter), like native `change`. */
  @Event() tjChange!: EventEmitter<string>;

  @Watch('value')
  syncFormValue(value: string) {
    this.internals.setFormValue(value);
  }

  componentWillLoad() {
    this.internals.setFormValue(this.value);
  }

  formResetCallback() {
    this.value = '';
  }

  private onInput = (e: Event) => {
    this.value = (e.target as HTMLInputElement).value;
    this.tjInput.emit(this.value);
  };

  private onChange = () => this.tjChange.emit(this.value);

  render() {
    // The host's aria-label names the inner control (shadow DOM blocks
    // light-DOM <label for> from reaching it).
    const ariaLabel = this.host.getAttribute('aria-label') ?? undefined;
    return (
      <Host>
        <input
          part="control"
          class={{ input: true, invalid: this.invalid }}
          type={this.type}
          name={this.name}
          value={this.value}
          placeholder={this.placeholder}
          disabled={this.disabled}
          required={this.required}
          aria-label={ariaLabel}
          aria-invalid={this.invalid ? 'true' : undefined}
          onInput={this.onInput}
          onChange={this.onChange}
        />
      </Host>
    );
  }
}
