import React, { useState } from 'react';
import { GameState, Product, ProductCategory } from '../types/game';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';
import {
  Boxes,
  Plus,
  Lock,
  Unlock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  Search,
  Check,
  ShoppingBag,
  Info
} from 'lucide-react';

interface InventoryManagerProps {
  state: GameState;
  onBuyStock: (productId: string, quantity: number) => void;
  onUnlockProduct: (productId: string) => void;
  onUpdateSellingPrice: (productId: string, newPrice: number) => void;
  onToggleAutoRestock: (productId: string) => void;
  onUpdateAutoRestockSettings: (productId: string, threshold: number, amount: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  state,
  onBuyStock,
  onUnlockProduct,
  onUpdateSellingPrice,
  onToggleAutoRestock,
  onUpdateAutoRestockSettings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const currentWarehouse = state.warehouses[state.warehouseTier];
  const totalStockCount = state.products.reduce((acc, p) => acc + p.stock, 0);
  const capacityLeft = Math.max(0, currentWarehouse.capacity - totalStockCount);
  const capacityPercent = Math.min(100, (totalStockCount / currentWarehouse.capacity) * 100);

  const categories = [
    { id: 'all', label: 'Todos os Produtos' },
    { id: 'accessories', label: 'Acessórios' },
    { id: 'tech', label: 'Tech & Eletrônicos' },
    { id: 'gaming', label: 'Games & Consoles' },
    { id: 'fashion', label: 'Moda & Lifestyle' },
    { id: 'home', label: 'Casa Inteligente' },
  ];

  const filteredProducts = state.products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartEditPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setTempPrice(product.sellingPrice.toString());
  };

  const handleSavePrice = (productId: string) => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateSellingPrice(productId, parsed);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-6">
      {/* Warehouse Storage Capacity Meter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Logística de Estoque
              </span>
              <span className="text-xs text-slate-400">{currentWarehouse.name}</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Catálogo de Produtos & Fornecedores
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compre lotes direto dos fornecedores no atacado, ajuste o preço de venda e defina reposição automática.
            </p>
          </div>

          {/* Storage Capacity Gauge */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 min-w-[260px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-emerald-400" />
                Ocupação do Armazém:
              </span>
              <span className="text-white">
                <strong className={capacityLeft === 0 ? 'text-rose-400 font-black' : 'text-emerald-400'}>
                  {totalStockCount}
                </strong>
                <span className="text-slate-500"> / {currentWarehouse.capacity} un.</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  capacityPercent >= 95
                    ? 'bg-rose-500'
                    : capacityPercent >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
              <span>Espaço Livre: {capacityLeft} un.</span>
              <span>{Math.round(capacityPercent)}% lotado</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar no catálogo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const isOutOfStock = product.stock === 0;
          const isLowStock = product.stock > 0 && product.stock <= 5;
          const profitPerUnit = product.sellingPrice - product.baseCost;
          const profitMargin = Math.round((profitPerUnit / product.sellingPrice) * 100);

          if (!product.unlocked) {
            const canUnlock = state.cash >= product.unlockCost;
            return (
              <div
                key={product.id}
                className="bg-slate-900/60 border border-slate-800/80 border-dashed rounded-2xl p-5 flex flex-col justify-between relative opacity-85 hover:opacity-100 transition-opacity"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                      <Lock className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Bloqueado
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-300 mt-3">{product.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{product.description}</p>

                  <div className="mt-4 bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Custo de Fornecedor:</span>
                      <strong className="text-slate-300">{formatCurrency(product.baseCost)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Preço Sugerido:</span>
                      <strong className="text-emerald-400">{formatCurrency(product.recommendedPrice)}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      if (canUnlock) {
                        sound.playSuccess();
                        onUnlockProduct(product.id);
                      } else {
                        sound.playWarning();
                      }
                    }}
                    disabled={!canUnlock}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      canUnlock
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Unlock className="w-4 h-4" />
                    Desbloquear Produto ({formatCurrency(product.unlockCost)})
                  </button>
                </div>
              </div>
            );
          }

          // Unlocked Product Card
          return (
            <div
              key={product.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 ${
                isOutOfStock
                  ? 'border-rose-500/40 shadow-sm shadow-rose-500/5'
                  : isLowStock
                  ? 'border-amber-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {product.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  {/* Stock Pill */}
                  <div
                    className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 ${
                      isOutOfStock
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isLowStock
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>{product.stock} un.</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-1">{product.description}</p>

                {/* Sourcing Cost & Selling Price Config */}
                <div className="mt-4 bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Custo no Atacado:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatCurrency(product.baseCost)} / un.
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Preço de Venda:</span>
                    {editingPriceId === product.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.10"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-700 text-xs font-bold text-white px-2 py-0.5 rounded focus:outline-none focus:border-emerald-500 text-right"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSavePrice(product.id)}
                        />
                        <button
                          onClick={() => handleSavePrice(product.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditPrice(product)}
                        className="font-mono font-black text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
                        title="Clique para editar o preço"
                      >
                        {formatCurrency(product.sellingPrice)}
                      </button>
                    )}
                  </div>

                  {/* Margins */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500">Margem de Lucro:</span>
                    <span className="font-semibold text-teal-400">
                      +{formatCurrency(profitPerUnit)} ({profitMargin}%)
                    </span>
                  </div>
                </div>

                {/* Auto Restock Toggle */}
                <div className="mt-3 flex items-center justify-between px-2 py-1 rounded-lg bg-slate-950/40 border border-slate-800/50 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.autoRestock}
                      onChange={() => {
                        sound.playClick();
                        onToggleAutoRestock(product.id);
                      }}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 text-[11px] font-medium">Reposição Automática</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Se &lt; {product.autoRestockThreshold} un. (+{product.autoRestockAmount})
                  </span>
                </div>
              </div>

              {/* Buy Stock Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Comprar Lote do Fornecedor:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[5, 15, 30].map((qty) => {
                    const cost = product.baseCost * qty;
                    const canAfford = state.cash >= cost;
                    const hasCapacity = capacityLeft >= qty;

                    return (
                      <button
                        key={qty}
                        onClick={() => {
                          if (canAfford && hasCapacity) {
                            sound.playCash();
                            onBuyStock(product.id, qty);
                          } else {
                            sound.playWarning();
                          }
                        }}
                        disabled={!canAfford || !hasCapacity}
                        className={`py-2 px-1.5 rounded-xl text-center text-xs font-bold transition-all ${
                          canAfford && hasCapacity
                            ? 'bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 border border-slate-700'
                            : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                        }`}
                      >
                        <div>+{qty} un.</div>
                        <div className="text-[10px] opacity-80 font-normal">{formatCurrency(cost)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
