   M S B A M L   `   `   `  ����F  BHTTPMonitor, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null;"clr-namespace:HTTPMonitor.ControlsHTTPMonitor.Controls  5      ,    &HTTPMonitor.Controls.StatisticsControl   5      W SPresentationCore, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35\ XPresentationFramework, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35e aSystem.Windows.Controls.Ribbon, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089R NWindowsBase, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35F 9http://schemas.microsoft.com/winfx/2006/xaml/presentation     5      R NSystem.Xaml, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml     5      Jmc;http://schemas.openxmlformats.org/markup-compatibility/2006     5      @d2http://schemas.microsoft.com/expression/blend/2008     5      4local"clr-namespace:HTTPMonitor.Controls     5      .��5	      �   � RowDefinitions  5
   
   �� 5      $
��Auto �6   �� 5      $
��Auto �6   �� 5      $��* �6   �� 5      $��* �6   .+�5   
   �� $��0��6   $��Server Statistics��6    $��
10,10,10,5q�6;   .��5      � $��5q�6    � ColumnDefinitions 5      �� 5      $��* �6'   �� 5      $��* �6'   �� 5      $��* �6'     5      �� 5      $
��Auto �6$   �� 5      $
��Auto �6$   �� 5      $
��Auto �6$   .+�5      �� $��0��6   $��0��6)   $��Uptime:��69   $��5q�6H   �� 5       -   5         ��Name$ UptimeTextBlock��5    9   $��0��6   $��1��6)   $��00:00:00��6R   $��5q�6b   �� 5!      -   5        $ StartTimeTextBlock��5!   9   $��0��6   $��2��6)   $��Start Time: N/A��6U   $��5q�6l   �� 5#      $��1��6   $��0��6)   $��Total Requests:��69   $��5q�6P   �� 5$      -   5        $ TotalRequestsTextBlock��5$   9   $��1��6   $��1��6)   $��0��6Y   $��5q�6b   �� 5%      -   5        $  AvgProcessingTimeTextBlock��5%   9   $��1��6   $��2��6)   $��Avg. Time: 0ms��6]   $��5q�6s   �� 5'      $��2��6   $��0��6)   $��GET Requests:��69   $��5q�6N   �� 5(      -   5        $ GetRequestsTextBlock��5(   9   $��2��6   $��1��6)   $��0��6W   $��5q�6`   �� 5)      -   5        $ PostRequestsTextBlock��5)   9   $��2��6   $��2��6)   $��POST Requests: 0��6X   $��5q�6p   5*      5+      �� 5.   
   $��1��6   $��Log Filters��6    $��	10,5,10,5q�65   .��5/      � $��5q�6    50      �� 51      $
��Auto �6'   �� 52      $��* �6'   �� 53      $
��Auto �6'   �� 54      $��* �6'   �� 55      $
��Auto �6'   .+�58      �� $��0��6   $��Method:��6,   $��Center=�6;   $��0,0,5,0q�6V   �� 59      -   5         ��Name$ MethodFilterComboBox��59   +   $��1��6    �� SelectedIndex$ 0��6I   $��0,0,10,0q�6[   .@�5:      �� $	��All��6#   �� 5;      $	��GET��6#   �� 5<      $
��POST��6#   5=      �� 5?      $��2��6   $��Status:��6,   $��Center=�6;   $��0,0,5,0q�6V   �� 5@      -   5        $ StatusFilterComboBox��5@   +   $��3��6   $ 0��6I   $��0,0,10,0q�6[   .@�5A      �� $	��All��6#   �� 5B      $��200 OK��6#   �� 5C      $��201 Created��6#   �� 5D      $��400 Bad Request��6#   �� 5E      $��404 Not Found��6#   �� 5F      $��500 Internal Server Error��6#   5G      �� 5I      -	   5        $��4��5I      $��Apply Filters��6)   $	��100��6\   5J      5K      �� 5N   
   $��2��6   $��Request Logs��6    $��	10,5,10,5q�66   .��5O      &   System.Windows.Controls.DataGrid  -
   5          Name$ LogsDataGrid��5O         AutoGenerateColumns$ False��6-      
IsReadOnly$
 True��6I      Columns 5P      0  *System.Windows.Controls.DataGridTextColumn  5Q      ,  &System.Windows.Controls.DataGridColumn	   Header$	 ID��6)   
   Width5  /System.Windows.Controls.DataGridLengthConverter$
 50 6L   1  +System.Windows.Controls.DataGridBoundColumn   Binding 65   �� *Id+6L     5R      $
	 Time��6)   $	
 140 6U    67   �� *	Timestamp+6U     5S      $
	 Type��6)   $
 80 6P    67   �� *Type+6P     5T      $	 Method��6)   $
 60 6T    69   �� *Method+6T     5U      $		 URL��6)   $
 * 6N    66   �� *Url+6N     5V      $	 Status��6)   $
 80 6X    69   �� *
StatusCode+6X     5W      $	 	Time (ms)��6)   $
 80 6a    6<   �� *ProcessingTimeMs+6a   5Y      5Z      �� 5]   
   $��3��6   $��Request Load (Last Hour)��6    $��
10,5,10,10q�6B   .��5^      �� -   5         ��Name$ ChartCanvas��5^      
�������6*   5_      5`      5a      