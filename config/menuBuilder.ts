import { MenuBuilder, type MenuItemConfig } from '@menu/index'
import { ArrowRightLeft, Boxes, Warehouse } from 'lucide-vue-next'

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
      children: [
        {
          id: 'stock-warehouses',
          title: 'Raktárak',
          path: '/admin/stock/warehouse',
          icon: Warehouse,
          order: 10,
        },
        {
          id: 'stock-warehouse-regions',
          title: 'Raktárrégiók',
          path: '/admin/stock/warehouse-region',
          icon: Boxes,
          order: 20,
        },
        {
          id: 'stock-movement',
          title: 'Készletmozgások',
          path: '/admin/stock/movement',
          icon: ArrowRightLeft,
          order: 30,
        },
      ],
    }

    this.addMenuItem(menu, stockSection)

    return menu
  }
}

export const stockMenuBuilder = new StockMenuBuilder()

