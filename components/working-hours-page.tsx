'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'

interface WorkingHoursPageProps {
  userRole: string
}

export default function WorkingHoursPage({ userRole }: WorkingHoursPageProps) {
  const [workingHours, setWorkingHours] = useState([
    { day: 'Monday', active: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', active: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', active: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', active: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', active: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', active: false, startTime: '09:00', endTime: '13:00' },
    { day: 'Sunday', active: false, startTime: '', endTime: '' },
  ])

  const [holidays, setHolidays] = useState([
    { id: '1', date: '2024-01-01', description: 'New Year Day' },
    { id: '2', date: '2024-12-25', description: 'Christmas' },
  ])

  const [showHolidayDialog, setShowHolidayDialog] = useState(false)
  const [holidayForm, setHolidayForm] = useState({ date: '', description: '' })

  const handleWorkingHourChange = (index: number, field: string, value: any) => {
    const updated = [...workingHours]
    updated[index] = { ...updated[index], [field]: value }
    setWorkingHours(updated)
  }

  const handleAddHoliday = () => {
    setHolidays([
      ...holidays,
      {
        id: String(holidays.length + 1),
        ...holidayForm,
      },
    ])
    setHolidayForm({ date: '', description: '' })
    setShowHolidayDialog(false)
  }

  const handleDeleteHoliday = (id: string) => {
    setHolidays(holidays.filter((h) => h.id !== id))
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-8 max-h-screen overflow-y-auto">
      {/* Working Hours Section */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Orare de lucru</h3>
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="text-foreground text-xs md:text-sm">Ziua</TableHead>
                  <TableHead className="text-foreground text-xs md:text-sm">Activ</TableHead>
                  <TableHead className="text-foreground text-xs md:text-sm">Inceput</TableHead>
                  <TableHead className="text-foreground text-xs md:text-sm">Sfarsit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workingHours.map((hour, index) => (
                  <TableRow key={hour.day} className="border-border hover:bg-secondary/30">
                    <TableCell className="font-medium text-foreground text-xs md:text-sm">{hour.day}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={hour.active}
                        onCheckedChange={(checked) =>
                          handleWorkingHourChange(index, 'active', checked)
                        }
                        className="border-border"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={hour.startTime}
                        onChange={(e) =>
                          handleWorkingHourChange(index, 'startTime', e.target.value)
                        }
                        disabled={!hour.active}
                        className="bg-input border-border text-foreground w-16 md:w-20 h-7 md:h-8 text-xs md:text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={hour.endTime}
                        onChange={(e) =>
                          handleWorkingHourChange(index, 'endTime', e.target.value)
                        }
                        disabled={!hour.active}
                        className="bg-input border-border text-foreground w-16 md:w-20 h-7 md:h-8 text-xs md:text-sm"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Holidays Section */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Zile de sarbatoare</h3>
          <Button
            onClick={() => setShowHolidayDialog(true)}
            className="bg-primary text-primary-foreground text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
            size="sm"
          >
            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Adauga sarbatoare
          </Button>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="text-foreground text-xs md:text-sm">Data</TableHead>
                  <TableHead className="text-foreground text-xs md:text-sm">Descriere</TableHead>
                  <TableHead className="text-foreground text-xs md:text-sm">Actiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday.id} className="border-border hover:bg-secondary/30">
                    <TableCell className="font-medium text-foreground text-xs md:text-sm">{holiday.date}</TableCell>
                    <TableCell className="text-foreground text-xs md:text-sm">{holiday.description}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        className="h-7 w-7 md:h-8 md:w-8"
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Add Holiday Dialog */}
      <Dialog open={showHolidayDialog} onOpenChange={setShowHolidayDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Adauga sarbatoare</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Data</Label>
              <Input
                type="date"
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-foreground">Descriere</Label>
              <Input
                value={holidayForm.description}
                onChange={(e) =>
                  setHolidayForm({ ...holidayForm, description: e.target.value })
                }
                placeholder="ex. Craciun"
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHolidayDialog(false)}>
              Anuleaza
            </Button>
            <Button onClick={handleAddHoliday} className="bg-primary text-primary-foreground">
              Adauga sarbatoare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
