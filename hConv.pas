{* hconv.c
 *
 * Copyright (c) 1992 by Waleed A. Muhanna
 *
 * Permission for nonprofit use and redistribution of this software and
 * its documentation is hereby granted without fee, provided that the
 * above copyright notice appear in all copies and that both that copyright
 * notice and this permission notice appear in supporting documentation.
 *
 * No representation is made about the suitability of this software for any
 * purpose.  It is provided 'as is' without express or implied warranty.
 *
 * Send any comments/suggestions/fixes/additions to:
 *		wmuhanna@magnus.acs.ohio-state.edu
 *
 *}

unit hConv;

interface

uses SysUtils;

const
  RPD = 0.01745329251994329577; {* radians per degree (pi/180) *}
  DoW: array[0..6] of string = ('«·√Õœ', '«·≈À‰Ì‰', '«·À·«À«¡', '«·√—»⁄«¡',
    '«·Œ„Ì”', '«·Ã„⁄…', '«·”» ');
  gMonthName: array[0..11] of string = ('January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December');
  hMonthName: array[0..11] of string = ('„Õ—„', '’›—', '—»Ì⁄ «·√Ê·', '—»Ì⁄ «·À«‰Ì',
    'Ã„«œÏ «·√Ê·', 'Ã„«œÏ «·À«‰Ì', '—Ã»', '‘⁄»«‰',
    '—„÷«‰', '‘Ê«·', '–Ê «·ﬁ⁄œ…', '–Ê «·ÕÃ…');

type
  sDate = record
    Time: Real;
    Day,
    Mon,
    Year,
    dw: Integer;
    nmTime: Double;
  end;
function CalDate(julday: Double): sdate;
function hDate(y, m, d: Integer; t: Real): sdate; overload;
function hDate(dt: TDateTime): sdate; overload;
function gDate(y, m, d: Integer): sdate;

function tMoonPhase(n: Longint; nph: Integer): Double;
function JulianDay(year, month, day: Integer; time: Real): Double;
function gDays(m, y: Integer): Integer;
function hDays(m, y: Integer): Integer;

implementation

{*
 * Given an integer _n_ and a phase selector (nph=0,1,2,3 for
 * new,first,full,last quarters respectively, function returns the
 * Julian date/time of the Nth such phase since January 1900.
 * Adapted from 'Astronomical  Formulae for Calculators' by
 * Jean Meeus, Third Edition, Willmann-Bell, 1985.
 *}
function tMoonPhase(n: Longint; nph: Integer): Double;
var
  jd, t, t2, t3, k, ma, sa, tf, xtra: Double;
begin
  k  := n + nph / 4.0;
  t  := k / 1236.85;
  t2 := t * t;
  t3 := t2 * t;
  jd := 2415020.75933 + (29.53058868 * k) - (1.178e-4 * t2) - (1.55e-7 * t3)
    + (3.3e-4 * sin(RPD * (166.56 + (132.87 * t) - (0.009173 * t2))));

  {* Sun's mean anomaly *}
  sa := RPD * (359.2242 + (29.10535608 * k) - (3.33e-5 * t2) - (3.47e-6 * t3));

  {* Moon's mean anomaly *}
  ma := RPD * (306.0253 + (385.81691806 * k) + (0.0107306 * t2) + (1.236e-5 * t3));

  {* Moon's argument of latitude *}
  tf := RPD * 2.0 * (21.2964 + (390.67050646 * k) - (0.0016528 * t2) - (2.39e-6 * t3));

  {* should reduce to interval 0-1.0 before calculating further *}
  if ((nph = 0) or (nph = 2)) then
    {* Corrections for New and Full Moon *}
    xtra := (0.1734 - 0.000393 * t) * sin(sa) + (0.0021 * sin(sa * 2))
      - (0.4068 * sin(ma)) + (0.0161 * sin(2 * ma)) - (0.0004 * sin(3 * ma)) +
      (0.0104 * sin(tf)) - (0.0051 * sin(sa + ma)) - (0.0074 * sin(sa - ma)) +
      (0.0004 * sin(tf + sa)) - (0.0004 * sin(tf - sa)) - (0.0006 * sin(tf + ma))
      + (0.0010 * sin(tf - ma)) + (0.0005 * sin(sa + 2 * ma))
  else if ((nph = 1) or (nph = 3)) then
  begin
    xtra := (0.1721 - 0.0004 * t) * sin(sa) + (0.0021 * sin(sa * 2))
      - (0.6280 * sin(ma)) + (0.0089 * sin(2 * ma)) - (0.0004 * sin(3 * ma)) +
      (0.0079 * sin(tf)) - (0.0119 * sin(sa + ma)) - (0.0047 * sin(sa - ma)) +
      (0.0003 * sin(tf + sa)) - (0.0004 * sin(tf - sa)) - (0.0006 * sin(tf + ma))
      + (0.0021 * sin(tf - ma)) + (0.0003 * sin(sa + 2 * ma)) +
      (0.0004 * sin(sa - 2 * ma)) - (0.0003 * sin(2 * sa + ma));
    if (nph = 1) then
      xtra := xtra + 0.0028 - 0.0004 * cos(sa) + 0.0003 * cos(ma)
    else
      xtra := xtra - 0.0028 + 0.0004 * cos(sa) - 0.0003 * cos(ma);
  end
  else
  begin
    //      printf('tmoonphase: illegal phase number\n');
    Exit;
  end;
  {* convert from Ephemeris Time (ET) to (approximate) Universal Time (UT) *}
  jd     := jd + xtra - (0.41 + 1.2053 * t + 0.4992 * t2) / 1440;
  Result := jd;
end;


{* parameters for Makkah: for a new moon to be visible after sunset on
   a the same day in which it started, it has to have started before
   (SUNSET-MINAGE)-TIMZ=3 A.M. local time. *}
const
  TIMZ   = 3.0;
  MINAGE = 13.5;
  SUNSET = 19.5; {*approximate *}
  TIMDIF = (SUNSET - MINAGE);

function Visible(n: Longint; var rjd: Double): Double;
var
  jd: Double;
  tf: Real;
  d: Longint;
begin
  jd  := tMoonPhase(n, 0);
  rjd := jd;
  d   := Trunc(jd);
  tf  := (jd - d);
  if (tf <= 0.5) then {*new moon starts in the afternoon *}
  begin
    Result := jd + 1.0;
    Exit;
  end;
  {* new moon starts before noon *}
  tf := (tf - 0.5) * 24 + TIMZ;  {* local time *}
  if (tf > TIMDIF) then  {*age at sunset < min for visiblity*}
  begin
    Result := jd + 1.0;
    Exit;
  end;
  Result := jd;
end;

{*
 * Returns the Julian date (the Julian day number at _time_) of the
 * given calendar date specified by _year_, _month_, and _day_.
 * Positive year signifies A.D.; negative, B.C.
 *}
function JulianDay(year, month, day: Integer; time: Real): Double;
var
  jul: Double;
  m, y, ja: Longint;
begin
  if (year < 0) then
    Inc(year);
  if (month > 2) then
  begin
    y := year;
    m := month;
  end
  else
  begin
    y := year - 1;
    m := month + 12;
  end;
  jul := y * 365.25;
  if (y < 1) then
    jul := jul - 0.75;
  jul := Trunc(jul) + Trunc(30.6001 * (m + 1)) + day + time + 1720994.5;
  if (year + (month * 1e-2) + (day + time) * 1e-4 >= 1582.1015) then
  begin
    {* cross-over to Gregorian calendar *}
    ja  := Trunc(0.01 * y);
    jul := jul + 2 - ja + (Trunc(0.25 * ja));
  end;
  Result := jul;
end;

{*
 * inverse function of Julianday.
 *}
function CalDate(julday: Double): sDate;
var
  sd: sDate;
  z, alpha, a, b, c, d, e: Longint;
  f: Double;
begin
  julday := julday + 0.5;
  z      := Trunc(julday);
  f      := julday - z;
  if (z < 2299161) then {* test whether to change to Gregorian cal *}
    a := z
  else
  begin
    alpha := Trunc((z - 1867216.25) / 36524.25);
    a     := Trunc(z + 1 + alpha - alpha / 4);
  end;
  b       := a + 1524;
  c       := Trunc((b - 122.1) / 365.25);
  d       := Trunc(365.25 * c);
  e       := Trunc((b - d) / 30.6001);
  f       := f + b - d - (30.6001 * e);
  sd.Day  := Trunc(f);
  sd.Time := f - sd.day;
  if (e > 13) then
    sd.Mon := e - 13
  else
    sd.Mon := e - 1;
  if (sd.Mon > 2) then
    sd.Year := c - 4716
  else
    sd.Year := c - 4715;
  {*
  sd.dw = ((long) (julianday(sd.year,sd.mon, sd.day, 0.0) + 1.5)) % 7;
  *}
  sd.dw := Trunc(julday - sd.time + 1.1) mod 7;
  if (sd.Year <= 0) then
    Dec(sd.year);
  Result := sd;
end;

{*
 * Given a gregorian/julian date, compute corresponding Hijri date structure
 * As a reference point, the routine uses the fact that the year
 * 1405 A.H. started immediatly after lunar conjunction number 1048
 * which occured on September 1984 25d 3h 10m UT.
 *}
function hDate(y, m, d: Integer; t: Real): sDate;
var
  h: sDate;
  jd, mjd, rjd: Double;
  k, hm: Longint;
begin
  jd := JulianDay(y, m, d, t);
  {* obtain first approx. of how many new moons since the beginning of the year 1900 *}
  k := Trunc(0.6 + (y + ((m - 0.5) / 12.0) + (d / 365.0) - 1900) * 12.3685);
  repeat
    mjd := Visible(k, rjd);
    Dec(k);
  until (mjd <= jd);
  Inc(k);
  {*first of the month is the following day*}
  hm     := k - 1048;
  h.Year := 1405 + Trunc(hm / 12);
  h.Mon  := (hm mod 12) + 1;
  if ((hm <> 0) and (h.Mon <= 0)) then
  begin
    h.Mon := h.Mon + 12;
    Dec(h.Year);
  end;
  if (h.Year <= 0) then
    Dec(h.year);
  h.Day  := Trunc(jd - mjd + 1.0);
  h.Time := 0.5;
  h.dw   := Trunc(jd + 1.5) mod 7;
  Result := h;
end;
//------------------------------------------------------------------------------

function hDate(dt: TDateTime): sDate;
var
  h: sDate;
  jd, mjd, rjd: Double;
  k, hm: Longint;
  y, m, d: Word;
begin
  DecodeDate(dt, y, m, d);
  jd := JulianDay(y, m, d, 0);
  {* obtain first approx. of how many new moons since the beginning of the year 1900 *}
  k := Trunc(0.6 + (y + ((m - 0.5) / 12.0) + (d / 365.0) - 1900) * 12.3685);
  repeat
    mjd := Visible(k, rjd);
    Dec(k);
  until (mjd <= jd);
  Inc(k);
  {*first of the month is the following day*}
  hm     := k - 1048;
  h.Year := 1405 + Trunc(hm / 12);
  h.Mon  := (hm mod 12) + 1;
  if ((hm <> 0) and (h.Mon <= 0)) then
  begin
    h.Mon := h.Mon + 12;
    Dec(h.Year);
  end;
  if (h.Year <= 0) then
    Dec(h.year);
  h.Day  := Trunc(jd - mjd + 1.0);
  h.Time := 0.5;
  h.dw   := Trunc(jd + 1.5) mod 7;
  Result := h;
end;


const
  NMONTHS = (1405 * 12 + 1);

{*
 * Given a Hijri date, compute corresponding C.E. date structure
 *}
function gDate(y, m, d: Integer): sDate;
var
  jd, rjd: Double;
  k: Longint;
  sd: sDate;
begin
  if (y < 0) then
    Inc(y);
  k         := m + y * 12 - NMONTHS;   {* # of months since 1/1/1405 *}
  jd        := Visible(k + 1048, rjd) + d;
  sd        := CalDate(jd);
  sd.nmTime := rjd;
  Result    := sd;
end;

function gDays(m, y: Integer): Integer;
const
  ndmnth: array[0..12] of Byte = (0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
var
  nd: Integer;
begin
  nd := ndmnth[m];
  if ((m = 2) and
    ((y mod 4) = 0) and
    ((y < 1582) or
    ((y mod 100) <> 0) or
    ((y mod 400) = 0)
    )
    ) then
    Inc(nd);
  Result := nd;
end;

function hDays(m, y: Integer): Integer;
var
  i: integer;
  sd: sDate;
begin
  i := 1;
  while ( i <= 31 ) do
  begin
    sd := gDate(y,m,i);
    if ( sd.Day > 0 ) then
      Inc(i)
    else
      Break;
  end;
  Result := 29;
end;

end.
