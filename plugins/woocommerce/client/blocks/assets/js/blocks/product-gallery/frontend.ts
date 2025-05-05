/**
 * External dependencies
 */
import {
	store,
	getContext as getContextFn,
	getElement,
	withScope,
} from '@wordpress/interactivity';

/**
 * Internal dependencies
 */
import type { ProductGalleryContext } from './types';
import { checkOverflow } from './utils';

const getContext = ( ns?: string ) =>
	getContextFn< ProductGalleryContext >( ns );

const getArrowsState = ( imageIndex: number, totalImages: number ) => ( {
	disableLeft: imageIndex === 0,
	disableRight: imageIndex === totalImages - 1,
} );

/**
 * Scrolls the image into view for the main image.
 *
 * We use getElement to get the current element that triggered the action
 * to find the closest gallery container and scroll the image into view.
 * This is necessary because if you have two galleries on the same page with the same image IDs,
 * then we need to query the image in the correct gallery to avoid scrolling the wrong image into view.
 *
 * @param {string} imageId - The ID of the image to scroll into view.
 */
const scrollImageIntoView = ( imageId: number ) => {
	if ( ! imageId ) {
		return;
	}

	// Get the current element that triggered the action
	const element = getElement()?.ref as HTMLElement;

	if ( ! element ) {
		return;
	}

	// Find the closest gallery container
	const galleryContainer = element.closest(
		'.wp-block-woocommerce-product-gallery'
	);

	if ( ! galleryContainer ) {
		return;
	}

	const imageElement = galleryContainer.querySelector(
		`.wp-block-woocommerce-product-gallery-large-image img[data-image-id="${ imageId }"]`
	);

	if ( imageElement ) {
		imageElement.scrollIntoView( {
			behavior: 'smooth',
			block: 'nearest',
			inline: 'center',
		} );
	}
};

/**
 * Scrolls the thumbnail into view.
 *
 * @param {number} imageId - The ID of the thumbnail to scroll into view.
 */
const scrollThumbnailIntoView = ( imageId: number ) => {
	if ( ! imageId ) {
		return;
	}

	// Get the current element that triggered the action
	const element = getElement()?.ref as HTMLElement;

	if ( ! element ) {
		return;
	}

	// Find the closest gallery container
	const galleryContainer = element.closest(
		'.wp-block-woocommerce-product-gallery'
	);

	if ( ! galleryContainer ) {
		return;
	}

	const thumbnailElement = galleryContainer.querySelector(
		`.wc-block-product-gallery-thumbnails__thumbnail img[data-image-id="${ imageId }"]`
	);

	if ( ! thumbnailElement ) {
		return;
	}

	// Find the thumbnail scrollable container
	const scrollContainer = thumbnailElement.closest(
		'.wc-block-product-gallery-thumbnails__scrollable'
	);

	if ( ! scrollContainer ) {
		return;
	}

	const thumbnail = thumbnailElement.closest(
		'.wc-block-product-gallery-thumbnails__thumbnail'
	);

	if ( ! thumbnail ) {
		return;
	}

	// Calculate the scroll position to center the thumbnail
	const containerRect = scrollContainer.getBoundingClientRect();
	const thumbnailRect = thumbnail.getBoundingClientRect();

	const scrollTop =
		scrollContainer.scrollTop +
		( thumbnailRect.top - containerRect.top ) -
		( containerRect.height - thumbnailRect.height ) / 2;
	const scrollLeft =
		scrollContainer.scrollLeft +
		( thumbnailRect.left - containerRect.left ) -
		( containerRect.width - thumbnailRect.width ) / 2;

	// Use scrollTo to avoid scrolling the entire page which
	// happens with scrollIntoView.
	scrollContainer.scrollTo( {
		top: scrollTop,
		left: scrollLeft,
		behavior: 'smooth',
	} );
};

const productGallery = {
	state: {
		/**
		 * The index of the active image in the imageIds array.
		 *
		 * @return {number} The index of the active image.
		 */
		get imageIndex(): number {
			const { imageData, selectedImageId } = getContext();
			return imageData.indexOf( selectedImageId );
		},
	},
	actions: {
		selectImage: ( newImageIndex: number ) => {
			const context = getContext();
			const { imageData } = context;

			const imageId = imageData[ newImageIndex ];
			const { disableLeft, disableRight } = getArrowsState(
				newImageIndex,
				imageData.length
			);

			context.disableLeft = disableLeft;
			context.disableRight = disableRight;
			context.selectedImageId = imageId;

			if ( imageId !== -1 ) {
				scrollImageIntoView( imageId );
				scrollThumbnailIntoView( imageId );
			}
		},
		selectCurrentImage: ( event?: MouseEvent ) => {
			if ( event ) {
				event.stopPropagation();
			}
			const element = getElement()?.ref as HTMLElement;
			if ( ! element ) {
				return;
			}
			const imageIdValue = element.getAttribute( 'data-image-id' );
			if ( ! imageIdValue ) {
				return;
			}
			const imageId = parseInt( imageIdValue, 10 );
			const { imageData } = getContext();
			const newImageIndex = imageData.indexOf( imageId );
			actions.selectImage( newImageIndex );
		},
		selectNextImage: ( event?: MouseEvent ) => {
			if ( event ) {
				event.stopPropagation();
			}

			const { imageData, selectedImageId } = getContext();
			const selectedImageIndex = imageData.indexOf( selectedImageId );
			const newImageIndex = Math.min(
				imageData.length - 1,
				selectedImageIndex + 1
			);

			actions.selectImage( newImageIndex );
		},
		selectPreviousImage: ( event?: MouseEvent ) => {
			if ( event ) {
				event.stopPropagation();
			}

			const { imageData, selectedImageId } = getContext();
			const selectedImageIndex = imageData.indexOf( selectedImageId );
			const newImageIndex = Math.max( 0, selectedImageIndex - 1 );

			actions.selectImage( newImageIndex );
		},
		onSelectedLargeImageKeyDown: ( event: KeyboardEvent ) => {
			if (
				event.code === 'Enter' ||
				event.code === 'Space' ||
				event.code === 'NumpadEnter'
			) {
				if ( event.code === 'Space' ) {
					event.preventDefault();
				}
				actions.openDialog();
			}

			if ( event.code === 'ArrowRight' ) {
				actions.selectNextImage();
			}

			if ( event.code === 'ArrowLeft' ) {
				actions.selectPreviousImage();
			}
		},
		onThumbnailKeyDown: ( event: KeyboardEvent ) => {
			if (
				event.code === 'Enter' ||
				event.code === 'Space' ||
				event.code === 'NumpadEnter'
			) {
				if ( event.code === 'Space' ) {
					event.preventDefault();
				}
				actions.selectCurrentImage();
			}
		},
		onDialogKeyDown: ( event: KeyboardEvent ) => {
			if ( event.code === 'Escape' ) {
				actions.closeDialog();
			}
		},
		openDialog: () => {
			const context = getContext();
			context.isDialogOpen = true;
			document.body.classList.add(
				'wc-block-product-gallery-dialog-open'
			);
		},
		closeDialog: () => {
			const context = getContext();
			context.isDialogOpen = false;
			document.body.classList.remove(
				'wc-block-product-gallery-dialog-open'
			);
		},
		onTouchStart: ( event: TouchEvent ) => {
			const context = getContext();
			const { clientX } = event.touches[ 0 ];
			context.touchStartX = clientX;
			context.touchCurrentX = clientX;
			context.isDragging = true;
		},
		onTouchMove: ( event: TouchEvent ) => {
			const context = getContext();
			if ( ! context.isDragging ) {
				return;
			}
			const { clientX } = event.touches[ 0 ];
			context.touchCurrentX = clientX;
			event.preventDefault();
		},
		onTouchEnd: () => {
			const context = getContext();
			if ( ! context.isDragging ) {
				return;
			}

			const SNAP_THRESHOLD = 0.2;
			const delta = context.touchCurrentX - context.touchStartX;
			const element = getElement()?.ref as HTMLElement;
			const imageWidth = element?.offsetWidth || 0;

			// Only trigger swipe actions if there was significant movement
			if ( Math.abs( delta ) > imageWidth * SNAP_THRESHOLD ) {
				if ( delta > 0 && ! context.disableLeft ) {
					actions.selectPreviousImage();
				} else if ( delta < 0 && ! context.disableRight ) {
					actions.selectNextImage();
				}
			}

			// Reset touch state
			context.isDragging = false;
			context.touchStartX = 0;
			context.touchCurrentX = 0;
		},
		onScroll: () => {
			const scrollableElement = getElement()?.ref;
			if ( ! scrollableElement ) {
				return;
			}
			const context = getContext();
			const overflowState = checkOverflow( scrollableElement );

			context.thumbnailsOverflow = overflowState;
		},
	},
	callbacks: {
		watchForChangesOnAddToCartForm: () => {
			const context = getContext();
			const variableProductCartForm = document.querySelector(
				`form[data-product_id="${ context.productId }"]`
			);

			if ( ! variableProductCartForm ) {
				return;
			}

			const selectFirstImage = () =>
				withScope( () => actions.selectImage( 0 ) );

			const observer = new MutationObserver(
				withScope( function ( mutations ) {
					for ( const mutation of mutations ) {
						const { imageData } = getContext();

						const mutationTarget = mutation.target as HTMLElement;
						const currentImageAttribute =
							mutationTarget.getAttribute( 'current-image' );
						const currentImageId = currentImageAttribute
							? parseInt( currentImageAttribute, 10 )
							: null;
						if (
							mutation.type === 'attributes' &&
							currentImageId &&
							imageData.includes( currentImageId )
						) {
							const nextImageIndex =
								imageData.indexOf( currentImageId );

							actions.selectImage( nextImageIndex );
						} else {
							actions.selectImage( 0 );
						}
					}
				} )
			);

			observer.observe( variableProductCartForm, {
				attributes: true,
			} );

			const clearVariationsLink = document.querySelector(
				'.wp-block-add-to-cart-form .reset_variations'
			);

			if ( clearVariationsLink ) {
				clearVariationsLink.addEventListener(
					'click',
					selectFirstImage
				);
			}

			return () => {
				observer.disconnect();
				document.removeEventListener( 'click', selectFirstImage );
			};
		},
		dialogStateChange: () => {
			const { selectedImageId, isDialogOpen } = getContext();
			const { ref: dialogRef } = getElement() || {};

			if ( isDialogOpen && dialogRef instanceof HTMLElement ) {
				dialogRef.focus();
				const selectedImage = dialogRef.querySelector(
					`[data-image-id="${ selectedImageId }"]`
				);

				if ( selectedImage instanceof HTMLElement ) {
					selectedImage.scrollIntoView( {
						behavior: 'auto',
						block: 'center',
					} );
					selectedImage.focus();
				}
			}
		},
		toggleActiveImageAttributes: () => {
			const element = getElement()?.ref as HTMLElement;
			if ( ! element ) return false;

			const imageIdValue = element.getAttribute( 'data-image-id' );
			if ( ! imageIdValue ) return false;

			const { selectedImageId } = getContext();
			const imageId = Number( imageIdValue );

			if ( selectedImageId === imageId ) {
				element.classList.add( 'is-active' );
				element.setAttribute( 'tabIndex', '0' );
			} else {
				element.classList.remove( 'is-active' );
				element.setAttribute( 'tabIndex', '-1' );
			}
		},
	},
};

const { actions } = store( 'woocommerce/product-gallery', productGallery, {
	lock: true,
} );

export type Store = typeof productGallery;
