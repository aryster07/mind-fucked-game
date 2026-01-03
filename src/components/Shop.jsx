import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { 
  getShopItems, 
  getCosmeticsByType, 
  RARITY_COLORS, 
  RARITY_GLOW 
} from '../utils/cosmetics';
import { X, Coins, Zap, ShoppingBag, Lock } from 'lucide-react';
import clsx from 'clsx';

const Shop = ({ onClose }) => {
  const { userData, buyItem, equipItem, canAfford } = useUser();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState(null);

  const tabs = [
    { id: 'all', label: 'All Items', icon: ShoppingBag },
    { id: 'cardBack', label: 'Card Backs', icon: '🃏' },
    { id: 'tableTheme', label: 'Tables', icon: '🎲' },
    { id: 'avatar', label: 'Avatars', icon: '👤' },
    { id: 'emote', label: 'Emotes', icon: '😄' }
  ];

  const getItems = () => {
    if (activeTab === 'all') return getShopItems();
    return getCosmeticsByType(activeTab).filter(item => item.unlockMethod === 'shop');
  };

  const items = getItems();

  const handlePurchase = async (item) => {
    if (userData.ownedCosmetics?.includes(item.id)) {
      showNotification('Already owned!', 'info');
      return;
    }

    if (!canAfford(item.price, item.currency)) {
      showNotification(`Not enough ${item.currency}!`, 'error');
      return;
    }

    const result = await buyItem(item.id, item.price, item.currency);
    
    if (result.success) {
      showNotification(`${item.name} purchased!`, 'success');
      setSelectedItem(null);
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleEquip = async (item, type) => {
    const result = await equipItem(type, item.id);
    if (result.success) {
      showNotification(`${item.name} equipped!`, 'success');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const isOwned = (itemId) => userData?.ownedCosmetics?.includes(itemId);
  const isEquipped = (itemId, type) => userData?.equippedCosmetics?.[type] === itemId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border-2 border-gold/30 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gold/20 to-amber-900/20 border-b border-gold/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-gold flex items-center gap-2">
                <ShoppingBag size={32} />
                SHOP
              </h2>
              <p className="text-slate-400 text-sm mt-1">Customize your experience</p>
            </div>
            
            {/* Currency Display */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 bg-yellow-600/20 px-4 py-2 rounded-lg border border-yellow-500/30">
                <Coins className="text-yellow-500" size={20} />
                <span className="text-white font-bold">{userData?.coins || 0}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-500/30">
                <Zap className="text-purple-400" size={20} />
                <span className="text-white font-bold">{userData?.tokens || 0}</span>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-gold text-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                {typeof tab.icon === 'string' ? (
                  <span className="text-xl">{tab.icon}</span>
                ) : (
                  <tab.icon size={18} />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className={clsx(
                "absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg font-bold z-50 shadow-lg",
                notification.type === 'success' && "bg-green-600",
                notification.type === 'error' && "bg-red-600",
                notification.type === 'info' && "bg-blue-600"
              )}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => {
              const owned = isOwned(item.id);
              const equipped = isEquipped(item.id, activeTab !== 'all' ? activeTab : 'cardBack');
              const affordable = canAfford(item.price, item.currency);

              return (
                <motion.div
                  key={item.id}
                  layout
                  whileHover={{ scale: 1.05 }}
                  className={clsx(
                    "relative bg-slate-800/50 rounded-lg border-2 p-4 cursor-pointer transition-all",
                    RARITY_COLORS[item.rarity],
                    owned && "border-green-500",
                    equipped && "ring-2 ring-gold shadow-gold/50"
                  )}
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Preview */}
                  <div className="aspect-square bg-slate-900 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-white/10">
                    {item.icon && <span className="text-5xl">{item.icon}</span>}
                    {item.pattern && (
                      <div className={clsx(
                        "w-full h-full opacity-60",
                        `bg-[url('https://www.transparenttextures.com/patterns/${item.pattern}.png')]`
                      )}></div>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="font-bold text-white text-sm mb-1 truncate">{item.name}</h3>
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">{item.description}</p>

                  {/* Price/Status */}
                  <div className="flex items-center justify-between">
                    {owned ? (
                      <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                        ✓ Owned
                      </div>
                    ) : (
                      <div className={clsx(
                        "flex items-center gap-1 text-sm font-bold",
                        affordable ? "text-white" : "text-red-400"
                      )}>
                        {item.currency === 'coins' ? <Coins size={14} /> : <Zap size={14} />}
                        {item.price}
                      </div>
                    )}
                    
                    <span className={clsx("text-xs uppercase font-bold", RARITY_COLORS[item.rarity])}>
                      {item.rarity}
                    </span>
                  </div>

                  {/* Equipped Badge */}
                  {equipped && (
                    <div className="absolute top-2 right-2 bg-gold text-black text-xs font-bold px-2 py-1 rounded">
                      EQUIPPED
                    </div>
                  )}

                  {/* Lock Icon */}
                  {item.exclusive && !owned && (
                    <div className="absolute top-2 left-2 bg-red-600 p-1 rounded">
                      <Lock size={16} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {items.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
              <p>No items available in this category</p>
            </div>
          )}
        </div>

        {/* Item Detail Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 flex items-center justify-center p-8"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className={clsx(
                  "bg-slate-900 rounded-xl border-2 p-8 max-w-lg w-full",
                  RARITY_COLORS[selectedItem.rarity]
                )}
                onClick={e => e.stopPropagation()}
              >
                {/* Preview Large */}
                <div className="aspect-square bg-slate-950 rounded-lg mb-4 flex items-center justify-center border border-white/20">
                  {selectedItem.icon && <span className="text-9xl">{selectedItem.icon}</span>}
                </div>

                <h2 className="text-2xl font-black text-white mb-2">{selectedItem.name}</h2>
                <p className="text-slate-400 mb-4">{selectedItem.description}</p>

                <div className="flex gap-2 mb-6">
                  <span className={clsx("px-3 py-1 rounded text-sm font-bold", RARITY_COLORS[selectedItem.rarity])}>
                    {selectedItem.rarity.toUpperCase()}
                  </span>
                  {selectedItem.animated && (
                    <span className="px-3 py-1 rounded bg-blue-600/20 text-blue-400 text-sm font-bold border border-blue-500/30">
                      ANIMATED
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  {!isOwned(selectedItem.id) ? (
                    <button
                      onClick={() => handlePurchase(selectedItem)}
                      disabled={!canAfford(selectedItem.price, selectedItem.currency)}
                      className={clsx(
                        "flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2",
                        canAfford(selectedItem.price, selectedItem.currency)
                          ? "bg-gold text-black hover:bg-yellow-400"
                          : "bg-slate-700 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {selectedItem.currency === 'coins' ? <Coins size={20} /> : <Zap size={20} />}
                      Purchase ({selectedItem.price})
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEquip(selectedItem, activeTab !== 'all' ? activeTab : 'cardBack')}
                      className="flex-1 py-3 rounded-lg font-bold bg-green-600 text-white hover:bg-green-500 transition-all"
                    >
                      Equip
                    </button>
                  )}
                  
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-3 rounded-lg font-bold bg-slate-700 text-white hover:bg-slate-600 transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Shop;
