<?php
declare( strict_types = 1 );

namespace Automattic\WooCommerce\Tests\Blocks\Mocks;

use Automattic\WooCommerce\Blocks\BlockTypes\BlockifiedProductDetails;
use Automattic\WooCommerce\Blocks\Package;
use Automattic\WooCommerce\Blocks\Assets\Api;
use Automattic\WooCommerce\Blocks\Assets\AssetDataRegistry;
use Automattic\WooCommerce\Blocks\Integrations\IntegrationRegistry;

// phpcs:disable Generic.CodeAnalysis.UselessOverridingMethod.Found

/**
 * BlockifiedProductDetailsMock used to test BlockifiedProductDetails block functions.
 */
class BlockifiedProductDetailsMock extends BlockifiedProductDetails {

	/**
	 * Initialize our mock class.
	 */
	public function __construct() {
		parent::__construct(
			Package::container()->get( API::class ),
			Package::container()->get( AssetDataRegistry::class ),
			new IntegrationRegistry(),
		);
	}

	/**
	 * Mock implementation of register_block_type method.
	 *
	 * @return void
	 */
	protected function register_block_type() {}
}
