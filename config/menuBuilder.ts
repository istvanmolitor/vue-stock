import { MenuBuilder, type MenuItemConfig } from '@menu/index'
import { ArrowRightLeft, Boxes, ClipboardList, Package, Warehouse } from 'lucide-vue-next'

export class StockMenuBuilder extends MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    if (menuName === 'admin') {
      return this.buildMainMenu(menu)
    }

    return menu
  }

  private buildMainMenu(menu: MenuItemConfig): MenuItemConfig {
    const stockSection: MenuItemConfig = {
      id: 'stock-management',
      title: 'Készlet',
      icon: Boxes,
      order: 40,
      permission: ['stock', 'stock_movement'],
      children: [
        {
          id: 'stock-products',
          title: 'Termék készlet',
          path: '/admin/stock/products',
          icon: Package,
          order: 5,
          permission: 'stock',
        },
        {
          id: 'stock-warehouses',
          title: 'Raktárak',
          path: '/admin/stock/warehouse',
          icon: Warehouse,
          order: 10,
          permission: 'stock',
        },
        {
          id: 'stock-warehouse-regions',
          title: 'Raktárrégiók',
          path: '/admin/stock/warehouse-region',
          icon: Boxes,
          order: 20,
          permission: 'stock',
        },
        {
          id: 'stock-movement',
          title: 'Készletmozgások',
          path: '/admin/stock/movement',
          icon: ArrowRightLeft,
          order: 30,
          permission: 'stock_movement',
        },
        {
          id: 'stock-inventory',
          title: 'Leltár',
          path: '/admin/stock/inventory',
          icon: ClipboardList,
          order: 40,
          permission: 'stock',
        },
      ],
    }

    this.addMenuItem(menu, stockSection)

    return menu
  }
}

export const stockMenuBuilder = new StockMenuBuilder()

