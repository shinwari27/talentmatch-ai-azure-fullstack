import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';

export default function TagManager({ api, idKey, nameKey, badgeClassName, placeholder }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .list()
      .then(setItems)
      .catch((err) => setError(err.message || 'Could not load this section.'))
      .finally(() => setIsLoading(false));
  }, [api]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setError('');
    try {
      await api.add(inputValue.trim());
      const refreshed = await api.list();
      setItems(refreshed);
      setInputValue('');
    } catch (err) {
      setError(err.message || 'Could not add that.');
    }
  }

  async function handleRemove(id) {
    try {
      await api.remove(id);
      setItems(items.filter((i) => i[idKey] !== id));
    } catch (err) {
      setError(err.message || 'Could not remove that.');
    }
  }

  if (isLoading) return <LoadingSpinner label="Loading…" />;

  return (
    <div>
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item) => (
          <Badge key={item[idKey]} className={`${badgeClassName} flex items-center gap-1.5`}>
            {item[nameKey]}
            <button onClick={() => handleRemove(item[idKey])} aria-label={`Remove ${item[nameKey]}`}>
              <X size={12} />
            </button>
          </Badge>
        ))}
        {items.length === 0 && <span className="text-sm text-ink-500">None added yet.</span>}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 max-w-sm">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-ink-300 text-sm focus:border-primary-600 outline-none"
        />
        <button type="submit" className="text-sm text-primary-600 font-medium px-2">Add</button>
      </form>
    </div>
  );
}
