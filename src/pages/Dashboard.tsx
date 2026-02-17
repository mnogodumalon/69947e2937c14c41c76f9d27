import { useState, useEffect, useMemo } from 'react';
import type { Gewohnheiten, TrackingEintraege, TaeglicherCheckIn } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, formatDistanceToNow, startOfWeek, endOfWeek, eachDayOfInterval, isToday, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Plus,
  Flame,
  CheckCircle2,
  Star,
  Pencil,
  Trash2,
  Settings,
  CalendarCheck,
} from 'lucide-react';

// Category labels and colors
const KATEGORIE_LABELS: Record<string, string> = {
  gesundheit: 'Gesundheit',
  fitness: 'Fitness',
  ernaehrung: 'Ernährung',
  produktivitaet: 'Produktivität',
  persoenliche_entwicklung: 'Pers. Entwicklung',
  soziales: 'Soziales',
  finanzen: 'Finanzen',
  sonstiges: 'Sonstiges',
};

const HAEUFIGKEIT_LABELS: Record<string, string> = {
  taeglich: 'Täglich',
  mehrmals_woche: 'Mehrmals pro Woche',
  woechentlich: 'Wöchentlich',
  monatlich: 'Monatlich',
};

const STATUS_LABELS: Record<string, string> = {
  erledigt: 'Erledigt',
  teilweise: 'Teilweise',
  uebersprungen: 'Übersprungen',
};

const STATUS_COLORS: Record<string, string> = {
  erledigt: 'bg-green-100 text-green-800',
  teilweise: 'bg-yellow-100 text-yellow-800',
  uebersprungen: 'bg-red-100 text-red-800',
};

// Progress Ring Component
function ProgressRing({
  percentage,
  size = 160,
  strokeWidth = 6
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const isComplete = percentage >= 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? 'hsl(152 60% 40%)' : 'hsl(var(--primary))'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
          style={{
            filter: isComplete ? 'drop-shadow(0 0 8px hsl(152 60% 40% / 0.5))' : undefined,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold">{Math.round(percentage)}%</span>
        <span className="text-sm text-muted-foreground">heute erledigt</span>
      </div>
    </div>
  );
}

// Gewohnheit Dialog (Create/Edit)
function GewohnheitDialog({
  open,
  onOpenChange,
  gewohnheit,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gewohnheit?: Gewohnheiten | null;
  onSuccess: () => void;
}) {
  const isEditing = !!gewohnheit;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    gewohnheit_name: '',
    beschreibung: '',
    kategorie: 'sonstiges',
    ziel_haeufigkeit: 'taeglich',
    startdatum: format(new Date(), 'yyyy-MM-dd'),
    aktiv: true,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        gewohnheit_name: gewohnheit?.fields.gewohnheit_name ?? '',
        beschreibung: gewohnheit?.fields.beschreibung ?? '',
        kategorie: gewohnheit?.fields.kategorie ?? 'sonstiges',
        ziel_haeufigkeit: gewohnheit?.fields.ziel_haeufigkeit ?? 'taeglich',
        startdatum: gewohnheit?.fields.startdatum ?? format(new Date(), 'yyyy-MM-dd'),
        aktiv: gewohnheit?.fields.aktiv ?? true,
      });
    }
  }, [open, gewohnheit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.gewohnheit_name.trim()) {
      toast.error('Bitte gib einen Namen ein');
      return;
    }
    setSubmitting(true);
    try {
      const apiData = {
        gewohnheit_name: formData.gewohnheit_name,
        beschreibung: formData.beschreibung || undefined,
        kategorie: formData.kategorie as Gewohnheiten['fields']['kategorie'],
        ziel_haeufigkeit: formData.ziel_haeufigkeit as Gewohnheiten['fields']['ziel_haeufigkeit'],
        startdatum: formData.startdatum,
        aktiv: formData.aktiv,
      };

      if (isEditing) {
        await LivingAppsService.updateGewohnheitenEntry(gewohnheit!.record_id, apiData);
        toast.success('Gewohnheit aktualisiert');
      } else {
        await LivingAppsService.createGewohnheitenEntry(apiData);
        toast.success('Gewohnheit erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.gewohnheit_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, gewohnheit_name: e.target.value }))}
              placeholder="z.B. Morgens meditieren"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={formData.beschreibung}
              onChange={(e) => setFormData((prev) => ({ ...prev, beschreibung: e.target.value }))}
              placeholder="Optional: Notizen zur Gewohnheit"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select
                value={formData.kategorie}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, kategorie: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KATEGORIE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Häufigkeit *</Label>
              <Select
                value={formData.ziel_haeufigkeit}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, ziel_haeufigkeit: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HAEUFIGKEIT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startdatum">Startdatum</Label>
            <Input
              id="startdatum"
              type="date"
              value={formData.startdatum}
              onChange={(e) => setFormData((prev) => ({ ...prev, startdatum: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="aktiv"
              checked={formData.aktiv}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, aktiv: checked }))}
            />
            <Label htmlFor="aktiv">Gewohnheit ist aktiv</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Tracking Dialog (Create/Edit)
function TrackingDialog({
  open,
  onOpenChange,
  tracking,
  gewohnheiten,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracking?: TrackingEintraege | null;
  gewohnheiten: Gewohnheiten[];
  onSuccess: () => void;
}) {
  const isEditing = !!tracking;
  const [submitting, setSubmitting] = useState(false);
  const now = new Date();
  const [formData, setFormData] = useState({
    gewohnheit_id: '',
    datum: format(now, 'yyyy-MM-dd'),
    uhrzeit: format(now, 'HH:mm'),
    status: 'erledigt',
    bewertung: 0,
    notizen: '',
  });

  const activeGewohnheiten = gewohnheiten.filter((g) => g.fields.aktiv !== false);

  useEffect(() => {
    if (open) {
      if (tracking) {
        const existingGewohnheitId = extractRecordId(tracking.fields.gewohnheit);
        const dateTime = tracking.fields.datum_uhrzeit?.split('T') ?? [format(now, 'yyyy-MM-dd'), format(now, 'HH:mm')];
        setFormData({
          gewohnheit_id: existingGewohnheitId ?? '',
          datum: dateTime[0],
          uhrzeit: dateTime[1] ?? '12:00',
          status: tracking.fields.status ?? 'erledigt',
          bewertung: tracking.fields.bewertung ?? 0,
          notizen: tracking.fields.notizen ?? '',
        });
      } else {
        const nowNew = new Date();
        setFormData({
          gewohnheit_id: activeGewohnheiten[0]?.record_id ?? '',
          datum: format(nowNew, 'yyyy-MM-dd'),
          uhrzeit: format(nowNew, 'HH:mm'),
          status: 'erledigt',
          bewertung: 0,
          notizen: '',
        });
      }
    }
  }, [open, tracking, activeGewohnheiten.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.gewohnheit_id) {
      toast.error('Bitte wähle eine Gewohnheit');
      return;
    }
    setSubmitting(true);
    try {
      const apiData = {
        gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, formData.gewohnheit_id),
        datum_uhrzeit: `${formData.datum}T${formData.uhrzeit}`,
        status: formData.status,
        bewertung: formData.bewertung > 0 ? formData.bewertung : undefined,
        notizen: formData.notizen || undefined,
      };

      if (isEditing) {
        // Don't update gewohnheit field when editing
        const updateData = {
          datum_uhrzeit: apiData.datum_uhrzeit,
          status: apiData.status,
          bewertung: apiData.bewertung,
          notizen: apiData.notizen,
        };
        await LivingAppsService.updateTrackingEintraegeEntry(tracking!.record_id, updateData);
        toast.success('Eintrag aktualisiert');
      } else {
        await LivingAppsService.createTrackingEintraegeEntry(apiData);
        toast.success('Tracking gespeichert');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Eintrag bearbeiten' : 'Tracking eintragen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Gewohnheit *</Label>
            <Select
              value={formData.gewohnheit_id}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, gewohnheit_id: v }))}
              disabled={isEditing}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Gewohnheit auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {activeGewohnheiten.map((g) => (
                  <SelectItem key={g.record_id} value={g.record_id}>
                    {g.fields.gewohnheit_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datum">Datum</Label>
              <Input
                id="datum"
                type="date"
                value={formData.datum}
                onChange={(e) => setFormData((prev) => ({ ...prev, datum: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uhrzeit">Uhrzeit</Label>
              <Input
                id="uhrzeit"
                type="time"
                value={formData.uhrzeit}
                onChange={(e) => setFormData((prev) => ({ ...prev, uhrzeit: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status *</Label>
            <RadioGroup
              value={formData.status}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v }))}
              className="flex gap-4"
            >
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <RadioGroupItem value={key} id={`status-${key}`} />
                  <Label htmlFor={`status-${key}`} className="font-normal cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Bewertung (optional)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      bewertung: prev.bewertung === rating ? 0 : rating,
                    }))
                  }
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      rating <= formData.bewertung
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notizen">Notizen</Label>
            <Textarea
              id="notizen"
              value={formData.notizen}
              onChange={(e) => setFormData((prev) => ({ ...prev, notizen: e.target.value }))}
              placeholder="Optional: Wie lief es?"
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Eintragen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Check-in Dialog
function CheckInDialog({
  open,
  onOpenChange,
  checkIn,
  gewohnheiten,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkIn?: TaeglicherCheckIn | null;
  gewohnheiten: Gewohnheiten[];
  onSuccess: () => void;
}) {
  const isEditing = !!checkIn;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    checkin_datum: format(new Date(), 'yyyy-MM-dd'),
    erledigte_gewohnheiten: [] as string[],
    tagesnotizen: '',
  });

  const activeGewohnheiten = gewohnheiten.filter((g) => g.fields.aktiv !== false);

  useEffect(() => {
    if (open) {
      if (checkIn) {
        const erledigteRaw = checkIn.fields.erledigte_gewohnheiten;
        const erledigteArray = erledigteRaw ? erledigteRaw.split(',').map((s) => s.trim()) : [];
        setFormData({
          checkin_datum: checkIn.fields.checkin_datum ?? format(new Date(), 'yyyy-MM-dd'),
          erledigte_gewohnheiten: erledigteArray,
          tagesnotizen: checkIn.fields.tagesnotizen ?? '',
        });
      } else {
        setFormData({
          checkin_datum: format(new Date(), 'yyyy-MM-dd'),
          erledigte_gewohnheiten: [],
          tagesnotizen: '',
        });
      }
    }
  }, [open, checkIn]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const apiData = {
        checkin_datum: formData.checkin_datum,
        erledigte_gewohnheiten: formData.erledigte_gewohnheiten.join(', '),
        tagesnotizen: formData.tagesnotizen || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateTaeglicherCheckInEntry(checkIn!.record_id, apiData);
        toast.success('Check-in aktualisiert');
      } else {
        await LivingAppsService.createTaeglicherCheckInEntry(apiData);
        toast.success('Check-in gespeichert');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleGewohnheit(name: string) {
    setFormData((prev) => ({
      ...prev,
      erledigte_gewohnheiten: prev.erledigte_gewohnheiten.includes(name)
        ? prev.erledigte_gewohnheiten.filter((n) => n !== name)
        : [...prev.erledigte_gewohnheiten, name],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Check-in bearbeiten' : 'Täglicher Check-in'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkin_datum">Datum</Label>
            <Input
              id="checkin_datum"
              type="date"
              value={formData.checkin_datum}
              onChange={(e) => setFormData((prev) => ({ ...prev, checkin_datum: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Erledigte Gewohnheiten</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
              {activeGewohnheiten.map((g) => {
                const name = g.fields.gewohnheit_name ?? '';
                const isChecked = formData.erledigte_gewohnheiten.includes(name);
                return (
                  <label
                    key={g.record_id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                      isChecked ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleGewohnheit(name)}
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className={isChecked ? 'font-medium' : ''}>{name}</span>
                  </label>
                );
              })}
              {activeGewohnheiten.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">Keine aktiven Gewohnheiten</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagesnotizen">Tagesnotizen</Label>
            <Textarea
              id="tagesnotizen"
              value={formData.tagesnotizen}
              onChange={(e) => setFormData((prev) => ({ ...prev, tagesnotizen: e.target.value }))}
              placeholder="Wie war dein Tag?"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Check-in speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog
function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      toast.error('Fehler beim Löschen');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? 'Löscht...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <header className="bg-card border-b px-4 py-3">
        <Skeleton className="h-6 w-40" />
      </header>
      <main className="p-4 space-y-6">
        <div className="flex justify-center">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
        <div className="flex justify-center gap-8">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </main>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Data states
  const [gewohnheiten, setGewohnheiten] = useState<Gewohnheiten[]>([]);
  const [trackingEintraege, setTrackingEintraege] = useState<TrackingEintraege[]>([]);
  const [checkIns, setCheckIns] = useState<TaeglicherCheckIn[]>([]);

  // Dialog states
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [showGewohnheitDialog, setShowGewohnheitDialog] = useState(false);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [editGewohnheit, setEditGewohnheit] = useState<Gewohnheiten | null>(null);
  const [editTracking, setEditTracking] = useState<TrackingEintraege | null>(null);
  const [editCheckIn, setEditCheckIn] = useState<TaeglicherCheckIn | null>(null);

  // Delete dialog states
  const [deleteGewohnheit, setDeleteGewohnheit] = useState<Gewohnheiten | null>(null);
  const [deleteTracking, setDeleteTracking] = useState<TrackingEintraege | null>(null);
  const [deleteCheckIn, setDeleteCheckIn] = useState<TaeglicherCheckIn | null>(null);

  // Detail view state
  const [detailTracking, setDetailTracking] = useState<TrackingEintraege | null>(null);

  // Load data
  async function loadData() {
    try {
      setLoading(true);
      const [g, t, c] = await Promise.all([
        LivingAppsService.getGewohnheiten(),
        LivingAppsService.getTrackingEintraege(),
        LivingAppsService.getTaeglicherCheckIn(),
      ]);
      setGewohnheiten(g);
      setTrackingEintraege(t);
      setCheckIns(c);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Create lookup map for gewohnheiten
  const gewohnheitenMap = useMemo(() => {
    const map = new Map<string, Gewohnheiten>();
    gewohnheiten.forEach((g) => map.set(g.record_id, g));
    return map;
  }, [gewohnheiten]);

  // Calculate KPIs
  const activeGewohnheiten = useMemo(
    () => gewohnheiten.filter((g) => g.fields.aktiv !== false),
    [gewohnheiten]
  );

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Today's tracking entries
  const todayTrackingEntries = useMemo(
    () =>
      trackingEintraege.filter((t) => {
        const dateStr = t.fields.datum_uhrzeit?.split('T')[0];
        return dateStr === todayStr;
      }),
    [trackingEintraege, todayStr]
  );

  // Today's completion percentage
  const todayCompletionPercentage = useMemo(() => {
    if (activeGewohnheiten.length === 0) return 0;
    const completedToday = todayTrackingEntries.filter((t) => t.fields.status === 'erledigt');
    // Count unique habits completed today
    const uniqueCompletedHabits = new Set(
      completedToday.map((t) => extractRecordId(t.fields.gewohnheit)).filter(Boolean)
    );
    return Math.min(100, (uniqueCompletedHabits.size / activeGewohnheiten.length) * 100);
  }, [activeGewohnheiten, todayTrackingEntries]);

  // Streak calculation (consecutive days with at least one completion)
  const streak = useMemo(() => {
    const entriesByDate = new Map<string, TrackingEintraege[]>();
    trackingEintraege.forEach((t) => {
      const dateStr = t.fields.datum_uhrzeit?.split('T')[0];
      if (dateStr && t.fields.status === 'erledigt') {
        if (!entriesByDate.has(dateStr)) {
          entriesByDate.set(dateStr, []);
        }
        entriesByDate.get(dateStr)!.push(t);
      }
    });

    let count = 0;
    let currentDate = new Date();
    // Check if today has entries, if not start from yesterday
    if (!entriesByDate.has(format(currentDate, 'yyyy-MM-dd'))) {
      currentDate = subDays(currentDate, 1);
    }

    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (entriesByDate.has(dateStr)) {
        count++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    return count;
  }, [trackingEintraege]);

  // This week stats
  const weekStats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { locale: de });
    const weekEnd = endOfWeek(new Date(), { locale: de });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    let totalExpected = activeGewohnheiten.length * weekDays.filter((d) => d <= new Date()).length;
    let totalCompleted = 0;

    trackingEintraege.forEach((t) => {
      const dateStr = t.fields.datum_uhrzeit?.split('T')[0];
      if (dateStr && t.fields.status === 'erledigt') {
        const date = parseISO(dateStr);
        if (date >= weekStart && date <= weekEnd) {
          totalCompleted++;
        }
      }
    });

    return { completed: totalCompleted, total: Math.max(totalExpected, totalCompleted) };
  }, [trackingEintraege, activeGewohnheiten]);

  // Average rating
  const avgRating = useMemo(() => {
    const ratings = trackingEintraege
      .map((t) => t.fields.bewertung)
      .filter((r): r is number => r != null && r > 0);
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }, [trackingEintraege]);

  // Chart data for last 7 days
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayEntries = trackingEintraege.filter((t) => {
        const entryDate = t.fields.datum_uhrzeit?.split('T')[0];
        return entryDate === dateStr && t.fields.status === 'erledigt';
      });
      return {
        name: format(day, 'EEE', { locale: de }),
        date: dateStr,
        completed: dayEntries.length,
        isToday: isToday(day),
      };
    });
  }, [trackingEintraege]);

  // Recent entries (sorted by date, newest first)
  const recentEntries = useMemo(() => {
    return [...trackingEintraege]
      .sort((a, b) => {
        const dateA = a.fields.datum_uhrzeit ?? '';
        const dateB = b.fields.datum_uhrzeit ?? '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 10);
  }, [trackingEintraege]);

  // Habits completed today (for the checklist)
  const todayCompletedHabitIds = useMemo(() => {
    return new Set(
      todayTrackingEntries
        .filter((t) => t.fields.status === 'erledigt')
        .map((t) => extractRecordId(t.fields.gewohnheit))
        .filter(Boolean)
    );
  }, [todayTrackingEntries]);

  // Delete handlers
  async function handleDeleteGewohnheit() {
    if (!deleteGewohnheit) return;
    await LivingAppsService.deleteGewohnheitenEntry(deleteGewohnheit.record_id);
    toast.success('Gewohnheit gelöscht');
    setDeleteGewohnheit(null);
    loadData();
  }

  async function handleDeleteTracking() {
    if (!deleteTracking) return;
    await LivingAppsService.deleteTrackingEintraegeEntry(deleteTracking.record_id);
    toast.success('Eintrag gelöscht');
    setDeleteTracking(null);
    loadData();
  }

  async function handleDeleteCheckIn() {
    if (!deleteCheckIn) return;
    await LivingAppsService.deleteTaeglicherCheckInEntry(deleteCheckIn.record_id);
    toast.success('Check-in gelöscht');
    setDeleteCheckIn(null);
    loadData();
  }

  // Quick log from habit card
  async function quickLogHabit(gewohnheit: Gewohnheiten) {
    try {
      const now = new Date();
      await LivingAppsService.createTrackingEintraegeEntry({
        gewohnheit: createRecordUrl(APP_IDS.GEWOHNHEITEN, gewohnheit.record_id),
        datum_uhrzeit: `${format(now, 'yyyy-MM-dd')}T${format(now, 'HH:mm')}`,
        status: 'erledigt',
      });
      toast.success(`"${gewohnheit.fields.gewohnheit_name}" erledigt!`);
      loadData();
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
  }

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error.message}</p>
            <Button onClick={loadData}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-medium">Gewohnheitstracker</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCheckInDialog(true)}
              className="hidden sm:flex"
            >
              <CalendarCheck className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <Settings className="h-5 w-5" />
            </Button>
            {/* Desktop primary action */}
            <Button onClick={() => setShowTrackingDialog(true)} className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-1" />
              Tracking eintragen
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 pb-24 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <ProgressRing percentage={todayCompletionPercentage} size={160} />

                  {/* Quick Stats */}
                  <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-foreground">{streak}</span>
                      <span>Tage</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">
                        {weekStats.completed}/{weekStats.total}
                      </span>
                      <span>Woche</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-foreground">{avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Habits (Mobile) */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  Heute zu erledigen
                  <Badge variant="secondary">{activeGewohnheiten.length}</Badge>
                </h2>
              </div>
              <div className="space-y-2">
                {activeGewohnheiten.map((g) => {
                  const isCompleted = todayCompletedHabitIds.has(g.record_id);
                  return (
                    <Card
                      key={g.record_id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isCompleted ? 'opacity-60' : ''
                      }`}
                      onClick={() => !isCompleted && quickLogHabit(g)}
                    >
                      <CardContent className="py-3 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isCompleted
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground/30'
                            }`}
                          >
                            {isCompleted && <CheckCircle2 className="h-4 w-4 text-white" />}
                          </div>
                          <div>
                            <p
                              className={`font-medium ${
                                isCompleted ? 'line-through text-muted-foreground' : ''
                              }`}
                            >
                              {g.fields.gewohnheit_name}
                            </p>
                            {g.fields.kategorie && (
                              <Badge variant="outline" className="text-xs mt-0.5">
                                {KATEGORIE_LABELS[g.fields.kategorie]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {activeGewohnheiten.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <p>Keine aktiven Gewohnheiten</p>
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => setShowGewohnheitDialog(true)}
                      >
                        Erste Gewohnheit erstellen
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Weekly Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Wochenverlauf</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={30} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelFormatter={(_, payload) => {
                          if (payload && payload[0]) {
                            return format(parseISO(payload[0].payload.date), 'PPP', { locale: de });
                          }
                          return '';
                        }}
                        formatter={(value: number) => [`${value} erledigt`, '']}
                      />
                      <Bar
                        dataKey="completed"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries (Table on desktop) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Letzte Einträge</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gewohnheit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Zeit</TableHead>
                        <TableHead>Bewertung</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentEntries.map((entry) => {
                        const gewohnheitId = extractRecordId(entry.fields.gewohnheit);
                        const gewohnheit = gewohnheitId
                          ? gewohnheitenMap.get(gewohnheitId)
                          : undefined;
                        return (
                          <TableRow
                            key={entry.record_id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setDetailTracking(entry)}
                          >
                            <TableCell className="font-medium">
                              {gewohnheit?.fields.gewohnheit_name ?? 'Unbekannt'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={STATUS_COLORS[entry.fields.status ?? 'erledigt']}
                                variant="secondary"
                              >
                                {STATUS_LABELS[entry.fields.status ?? 'erledigt']}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {entry.fields.datum_uhrzeit
                                ? formatDistanceToNow(parseISO(entry.fields.datum_uhrzeit), {
                                    addSuffix: true,
                                    locale: de,
                                  })
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {entry.fields.bewertung && entry.fields.bewertung > 0 ? (
                                <div className="flex items-center gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < entry.fields.bewertung!
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-muted-foreground/30'
                                      }`}
                                    />
                                  ))}
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditTracking(entry);
                                    setShowTrackingDialog(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTracking(entry);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {recentEntries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Noch keine Einträge
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile List */}
                <div className="sm:hidden space-y-2">
                  {recentEntries.slice(0, 5).map((entry) => {
                    const gewohnheitId = extractRecordId(entry.fields.gewohnheit);
                    const gewohnheit = gewohnheitId
                      ? gewohnheitenMap.get(gewohnheitId)
                      : undefined;
                    return (
                      <div
                        key={entry.record_id}
                        className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                        onClick={() => setDetailTracking(entry)}
                      >
                        <div>
                          <p className="font-medium">
                            {gewohnheit?.fields.gewohnheit_name ?? 'Unbekannt'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.fields.datum_uhrzeit
                              ? formatDistanceToNow(parseISO(entry.fields.datum_uhrzeit), {
                                  addSuffix: true,
                                  locale: de,
                                })
                              : '-'}
                          </p>
                        </div>
                        <Badge
                          className={STATUS_COLORS[entry.fields.status ?? 'erledigt']}
                          variant="secondary"
                        >
                          {STATUS_LABELS[entry.fields.status ?? 'erledigt']}
                        </Badge>
                      </div>
                    );
                  })}
                  {recentEntries.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Noch keine Einträge</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1/3 on desktop) */}
          <div className="space-y-6 hidden lg:block">
            {/* Habits List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Meine Gewohnheiten</CardTitle>
                <Button size="sm" onClick={() => setShowGewohnheitDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Neu
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {gewohnheiten.map((g) => (
                  <div
                    key={g.record_id}
                    className="group flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-medium truncate ${
                            g.fields.aktiv === false ? 'text-muted-foreground' : ''
                          }`}
                        >
                          {g.fields.gewohnheit_name}
                        </p>
                        {g.fields.aktiv === false && (
                          <Badge variant="outline" className="text-xs">
                            Inaktiv
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {g.fields.kategorie && (
                          <Badge variant="secondary" className="text-xs">
                            {KATEGORIE_LABELS[g.fields.kategorie]}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {HAEUFIGKEIT_LABELS[g.fields.ziel_haeufigkeit ?? 'taeglich']}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditGewohnheit(g);
                          setShowGewohnheitDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteGewohnheit(g)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {gewohnheiten.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Keine Gewohnheiten angelegt
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Check-ins Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">Tägliche Check-ins</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowCheckInDialog(true)}>
                  <CalendarCheck className="h-4 w-4 mr-1" />
                  Check-in
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {checkIns.slice(0, 5).map((c) => (
                    <div
                      key={c.record_id}
                      className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        setEditCheckIn(c);
                        setShowCheckInDialog(true);
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {c.fields.checkin_datum
                            ? format(parseISO(c.fields.checkin_datum), 'PPP', { locale: de })
                            : '-'}
                        </p>
                        {c.fields.erledigte_gewohnheiten && (
                          <p className="text-xs text-muted-foreground">
                            {c.fields.erledigte_gewohnheiten.split(',').length} erledigt
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCheckIn(c);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {checkIns.length === 0 && (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      Noch keine Check-ins
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t sm:hidden">
        <Button className="w-full h-12" onClick={() => setShowTrackingDialog(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Tracking eintragen
        </Button>
      </div>

      {/* Dialogs */}
      <GewohnheitDialog
        open={showGewohnheitDialog}
        onOpenChange={(open) => {
          setShowGewohnheitDialog(open);
          if (!open) setEditGewohnheit(null);
        }}
        gewohnheit={editGewohnheit}
        onSuccess={loadData}
      />

      <TrackingDialog
        open={showTrackingDialog}
        onOpenChange={(open) => {
          setShowTrackingDialog(open);
          if (!open) setEditTracking(null);
        }}
        tracking={editTracking}
        gewohnheiten={gewohnheiten}
        onSuccess={loadData}
      />

      <CheckInDialog
        open={showCheckInDialog}
        onOpenChange={(open) => {
          setShowCheckInDialog(open);
          if (!open) setEditCheckIn(null);
        }}
        checkIn={editCheckIn}
        gewohnheiten={gewohnheiten}
        onSuccess={loadData}
      />

      {/* Detail Dialog for Tracking Entry */}
      <Dialog open={!!detailTracking} onOpenChange={(open) => !open && setDetailTracking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tracking-Details</DialogTitle>
          </DialogHeader>
          {detailTracking && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Gewohnheit</p>
                <p className="font-medium">
                  {(() => {
                    const id = extractRecordId(detailTracking.fields.gewohnheit);
                    return id ? gewohnheitenMap.get(id)?.fields.gewohnheit_name : 'Unbekannt';
                  })()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Datum & Uhrzeit</p>
                <p className="font-medium">
                  {detailTracking.fields.datum_uhrzeit
                    ? format(parseISO(detailTracking.fields.datum_uhrzeit), 'PPPp', { locale: de })
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  className={STATUS_COLORS[detailTracking.fields.status ?? 'erledigt']}
                  variant="secondary"
                >
                  {STATUS_LABELS[detailTracking.fields.status ?? 'erledigt']}
                </Badge>
              </div>
              {detailTracking.fields.bewertung && detailTracking.fields.bewertung > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Bewertung</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < detailTracking.fields.bewertung!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {detailTracking.fields.notizen && (
                <div>
                  <p className="text-sm text-muted-foreground">Notizen</p>
                  <p className="whitespace-pre-wrap">{detailTracking.fields.notizen}</p>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditTracking(detailTracking);
                    setDetailTracking(null);
                    setShowTrackingDialog(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteTracking(detailTracking);
                    setDetailTracking(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Löschen
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialogs */}
      <DeleteDialog
        open={!!deleteGewohnheit}
        onOpenChange={(open) => !open && setDeleteGewohnheit(null)}
        title="Gewohnheit löschen?"
        description={`Möchtest du die Gewohnheit "${deleteGewohnheit?.fields.gewohnheit_name}" wirklich löschen? Alle zugehörigen Tracking-Einträge bleiben erhalten.`}
        onConfirm={handleDeleteGewohnheit}
      />

      <DeleteDialog
        open={!!deleteTracking}
        onOpenChange={(open) => !open && setDeleteTracking(null)}
        title="Eintrag löschen?"
        description={`Möchtest du diesen Tracking-Eintrag vom ${
          deleteTracking?.fields.datum_uhrzeit
            ? format(parseISO(deleteTracking.fields.datum_uhrzeit), 'PPP', { locale: de })
            : ''
        } wirklich löschen?`}
        onConfirm={handleDeleteTracking}
      />

      <DeleteDialog
        open={!!deleteCheckIn}
        onOpenChange={(open) => !open && setDeleteCheckIn(null)}
        title="Check-in löschen?"
        description={`Möchtest du den Check-in vom ${
          deleteCheckIn?.fields.checkin_datum
            ? format(parseISO(deleteCheckIn.fields.checkin_datum), 'PPP', { locale: de })
            : ''
        } wirklich löschen?`}
        onConfirm={handleDeleteCheckIn}
      />
    </div>
  );
}
