import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Visit, Expense } from "../../store/visitTypes";

interface ExpensesTabProps {
  detailForm: Partial<Visit>;
  totalExpenses: number;
  removeExpense: (id: string) => void;
  newExpenseLabel: string;
  setNewExpenseLabel: (v: string) => void;
  newExpenseAmount: string;
  setNewExpenseAmount: (v: string) => void;
  newExpenseCategory: string;
  setNewExpenseCategory: (v: string) => void;
  addExpense: () => void;
  t: (k: string) => string;
}

export function ExpensesTab({
  detailForm, totalExpenses, removeExpense,
  newExpenseLabel, setNewExpenseLabel, newExpenseAmount, setNewExpenseAmount,
  newExpenseCategory, setNewExpenseCategory, addExpense, t,
}: ExpensesTabProps) {
  const categories = ["carburant", "peage", "parking", "transport_commun", "restaurant", "hebergement", "autre"];
  const categoryLabels: Record<string, string> = {
    carburant: "⛽ Carburant", peage: "🛣️ Péage", parking: "🅿️ Parking",
    transport_commun: "🚆 Transport en commun", restaurant: "🍽️ Restaurant",
    hebergement: "🏠 Hébergement", autre: "📋 Autres frais",
  };
  const expenses: Expense[] = detailForm.expenses || [];
  const grouped = categories.map((cat) => ({
    cat, label: categoryLabels[cat],
    items: expenses.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0);
  const uncategorized = expenses.filter((e) => !e.category || !categories.includes(e.category));
  if (uncategorized.length > 0) grouped.push({ cat: "non_classe", label: "📋 Non classé", items: uncategorized });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-5 text-primary-foreground">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/80">{t("total_expenses")}</p>
        <p className="text-3xl font-black mt-1">{totalExpenses.toFixed(2)} €</p>
      </div>

      {grouped.map((g) => (
        <div key={g.cat} className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{g.label}</p>
          {g.items.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-sm font-bold text-foreground">{exp.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-foreground">{exp.amount.toFixed(2)} €</span>
                <button onClick={() => removeExpense(exp.id)} className="p-1 hover:text-destructive transition-colors" title="Supprimer"><X className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <p className="text-xs text-right text-muted-foreground font-bold">Sous-total : {g.items.reduce((s, e) => s + e.amount, 0).toFixed(2)} €</p>
        </div>
      ))}

      {expenses.length === 0 && (
        <p className="text-sm text-center text-muted-foreground py-4">Aucune dépense enregistrée</p>
      )}

      <div className="border-2 border-dashed border-border rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Nouvelle dépense (H-8)</p>
        <select className="input-soft text-sm" value={newExpenseCategory} onChange={(e) => setNewExpenseCategory(e.target.value)} title="Catégorie">
          <option value="carburant">⛽ Carburant</option>
          <option value="peage">🛣️ Péage</option>
          <option value="parking">🅿️ Parking</option>
          <option value="transport_commun">🚆 Transport en commun</option>
          <option value="restaurant">🍽️ Restaurant</option>
          <option value="hebergement">🏠 Hébergement</option>
          <option value="autre">📋 Autres frais</option>
        </select>
        <div className="grid grid-cols-3 gap-2">
          <input className="input-soft text-sm col-span-2" placeholder={t("expense_label")} value={newExpenseLabel} onChange={(e) => setNewExpenseLabel(e.target.value)} />
          <input className="input-soft text-sm" type="number" step="0.01" placeholder="0.00 €" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} />
        </div>
        <button onClick={addExpense} className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-xs font-bold text-muted-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-colors">
          + {t("add_expense")}
        </button>
      </div>

    </motion.div>
  );
}
