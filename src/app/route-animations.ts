import {
  animate,
  query,
  style,
  transition,
  trigger,
  group,
} from '@angular/animations';

const DURATION = '0.25s';
const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ opacity: 0, transform: 'translateY(16px)' })], {
      optional: true,
    }),
    group([
      query(
        ':leave',
        [
          animate(
            `${DURATION} ${EASING}`,
            style({ opacity: 0, transform: 'translateY(-12px)' })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            `${DURATION} ${EASING}`,
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);
